/**
 * Auto-detect language and project type automatically from code content
 * User ko manually select karne ki zaroorat nahi hai!
 */

export interface DetectedEnvironment {
  language: string;
  projectType: string;
  frameworkName: string;
  confidence: number;
}

export function autoDetectLanguageAndProject(code: string): DetectedEnvironment {
  const trimmed = code.trim();

  // 1. PHP / WordPress / Laravel
  if (
    trimmed.startsWith('<?php') ||
    trimmed.includes('<?php') ||
    code.includes('add_action(') ||
    code.includes('wp_') ||
    code.includes('defined(\'ABSPATH\')') ||
    code.includes('Route::get(') ||
    code.includes('namespace App\\') ||
    /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\s*=/.test(code)
  ) {
    if (code.includes('wp_') || code.includes('ABSPATH') || code.includes('add_action')) {
      return {
        language: 'php',
        projectType: 'wordpress',
        frameworkName: 'WordPress / PHP',
        confidence: 99,
      };
    }
    if (code.includes('Route::') || code.includes('Illuminate\\')) {
      return {
        language: 'php',
        projectType: 'laravel',
        frameworkName: 'Laravel / PHP',
        confidence: 95,
      };
    }
    return {
      language: 'php',
      projectType: 'php',
      frameworkName: 'Core PHP',
      confidence: 95,
    };
  }

  // 2. Python
  if (
    code.includes('def ') && (code.includes('import ') || code.includes('from ')) ||
    code.includes('class ') && code.includes('def __init__') ||
    code.includes('if __name__ == "__main__":') ||
    code.includes('FastAPI()') ||
    code.includes('from pydantic import') ||
    code.includes('logger = logging.getLogger') ||
    /#.*coding:/.test(code)
  ) {
    if (code.includes('FastAPI') || code.includes('@app.get') || code.includes('@app.post')) {
      return {
        language: 'python',
        projectType: 'fastapi',
        frameworkName: 'Python (FastAPI)',
        confidence: 95,
      };
    }
    if (code.includes('django') || code.includes('models.Model')) {
      return {
        language: 'python',
        projectType: 'django',
        frameworkName: 'Python (Django)',
        confidence: 95,
      };
    }
    return {
      language: 'python',
      projectType: 'python',
      frameworkName: 'Python (PEP 8)',
      confidence: 92,
    };
  }

  // 3. React / Next.js / TypeScript / JSX / TSX
  if (
    code.includes('import React') ||
    code.includes('useState(') ||
    code.includes('useEffect(') ||
    code.includes('useCallback(') ||
    code.includes('useRef(') ||
    code.includes('interface ') && code.includes('export ') ||
    code.includes('<div') && (code.includes('className=') || code.includes('onClick=')) ||
    code.includes('export default function') && code.includes('return (')
  ) {
    const isTs = code.includes('interface ') || code.includes(': React.') || code.includes('<T>') || code.includes('as const');
    return {
      language: isTs ? 'typescript' : 'javascript',
      projectType: 'react',
      frameworkName: isTs ? 'React / Next.js (TypeScript)' : 'React / Next.js (JavaScript)',
      confidence: 96,
    };
  }

  // 4. Node.js / Express
  if (
    code.includes('require(') ||
    code.includes('express()') ||
    code.includes('res.status(') ||
    code.includes('res.json(') ||
    code.includes('req.body') ||
    code.includes('jwt.sign(') ||
    code.includes('bcrypt.') ||
    code.includes('exports.') ||
    code.includes('module.exports =')
  ) {
    return {
      language: 'javascript',
      projectType: 'nodejs',
      frameworkName: 'Node.js / Express Backend',
      confidence: 95,
    };
  }

  // 5. HTML / Vanilla JS
  if (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<!--') && code.includes('<') ||
    code.includes('document.getElementById') ||
    code.includes('document.querySelector') ||
    code.includes('<form ') ||
    code.includes('<script>')
  ) {
    return {
      language: 'html',
      projectType: 'vanilla_html',
      frameworkName: 'HTML / Vanilla JavaScript',
      confidence: 92,
    };
  }

  // 6. SQL
  if (
    /\bSELECT\b[\s\S]+\bFROM\b/i.test(code) ||
    /\bCREATE TABLE\b/i.test(code) ||
    /\bINSERT INTO\b/i.test(code) ||
    /\bUPDATE\b[\s\S]+\bSET\b/i.test(code)
  ) {
    return {
      language: 'sql',
      projectType: 'sql',
      frameworkName: 'SQL / Database Query',
      confidence: 94,
    };
  }

  // 7. CSS / SCSS
  if (
    code.includes('@media') ||
    code.includes('@import') ||
    code.includes('{') && (code.includes('margin:') || code.includes('display: flex') || code.includes('color: #'))
  ) {
    return {
      language: 'css',
      projectType: 'css',
      frameworkName: 'CSS / Stylesheet',
      confidence: 90,
    };
  }

  // 8. Go (Golang)
  if (
    code.includes('package main') ||
    code.includes('func main()') ||
    code.includes('import "fmt"')
  ) {
    return {
      language: 'go',
      projectType: 'go',
      frameworkName: 'Go (Golang)',
      confidence: 95,
    };
  }

  // 9. Java
  if (
    code.includes('public class ') ||
    code.includes('public static void main') ||
    code.includes('import java.')
  ) {
    return {
      language: 'java',
      projectType: 'java',
      frameworkName: 'Java / Spring',
      confidence: 95,
    };
  }

  // Fallback to Universal JS / Clean Code
  return {
    language: 'javascript',
    projectType: 'universal',
    frameworkName: 'Universal Auto-Detected',
    confidence: 70,
  };
}
