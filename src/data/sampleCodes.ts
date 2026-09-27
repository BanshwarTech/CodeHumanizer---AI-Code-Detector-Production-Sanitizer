/**
 * Multi-Language Sample AI-generated code presets for testing
 * Supports WordPress, Node.js/Express, React/Next.js, Python, Laravel/PHP, HTML/CSS/JS, SQL, Java/Go
 */

export interface CodeSample {
  id: string;
  name: string;
  language: string;
  projectType: string;
  category: string;
  description: string;
  code: string;
}

export const SAMPLE_CODES: CodeSample[] = [
  {
    id: 'user_wordpress_importer',
    name: 'WordPress / PHP: Video Excel Importer (User Sample)',
    language: 'php',
    projectType: 'wordpress',
    category: 'WordPress / PHP',
    description: 'The exact 750+ line WordPress Excel & CSV Video Importer script with extreme vertical sprawl, robotic ASCII banners, and repetitive comments.',
    code: `<?php
/**
 * Video Excel Importer
 *
 * Features:
 * - Videos > Import Videos
 * - XLSX / CSV upload
 * - Title import
 * - Video embed code import
 * - Tracking URL import
 * - Existing video duplicate handling
 * - Draft / Publish / Pending
 * - Existing video se meta keys select karne ki facility
 */

if (!defined('ABSPATH')) {
    exit;
}


/*
|--------------------------------------------------------------------------
| Find Video Post Type
|--------------------------------------------------------------------------
*/

function vei_get_video_post_type() {

    $post_types = get_post_types(
        array(
            'show_ui' => true,
        ),
        'objects'
    );

    foreach ($post_types as $post_type => $object) {

        $name = strtolower($object->labels->name ?? '');
        $singular = strtolower($object->labels->singular_name ?? '');

        if (
            strpos($name, 'video') !== false ||
            strpos($singular, 'video') !== false
        ) {
            return $post_type;
        }
    }

    return 'video';
}


/*
|--------------------------------------------------------------------------
| Add Import Videos Menu
|--------------------------------------------------------------------------
*/

add_action('admin_menu', 'vei_add_import_menu', 9999);

function vei_add_import_menu() {

    global $menu;

    $videos_parent = '';

    /*
     * Find existing Videos admin menu.
     */
    foreach ($menu as $menu_item) {

        if (!empty($menu_item[0])) {

            $menu_title = wp_strip_all_tags($menu_item[0]);

            if (strtolower(trim($menu_title)) === 'videos') {

                $videos_parent = $menu_item[2];

                break;
            }
        }
    }

    if (!$videos_parent) {
        return;
    }

    add_submenu_page(
        $videos_parent,
        'Import Videos',
        'Import Videos',
        'edit_posts',
        'vei-import-videos',
        'vei_import_page'
    );
}


/*
|--------------------------------------------------------------------------
| Import Page
|--------------------------------------------------------------------------
*/

function vei_import_page() {

    if (!current_user_can('edit_posts')) {
        wp_die('You do not have permission to access this page.');
    }

    $post_type = vei_get_video_post_type();

    ?>

    <div class="wrap">

        <h1>Import Videos</h1>

        <div style="
            max-width:1000px;
            background:#fff;
            border:1px solid #dcdcde;
            padding:30px;
            margin-top:20px;
        ">

            <h2>Excel Video Importer</h2>

            <p>
                Excel file mein ye columns hone chahiye:
            </p>

            <p>
                <code>Title</code>
                &nbsp;&nbsp;
                <code>Video embed code</code>
                &nbsp;&nbsp;
                <code>Tracking URL</code>
            </p>

            <hr>

            <!--
            ----------------------------------------------------------
            Reference Video
            ----------------------------------------------------------
            -->

            <h2>1. Existing Video Mapping</h2>

            <p>
                Pehle kisi existing video ka ID enter karein.
                Isse aapke RetroTube ke actual meta fields select kiye
                ja sakenge.
            </p>

            <table class="form-table">

                <tr>

                    <th>
                        <label for="vei_reference_video">
                            Existing Video ID
                        </label>
                    </th>

                    <td>

                        <input
                            type="number"
                            id="vei_reference_video"
                            class="regular-text"
                            placeholder="Example: 123"
                        >

                        <button
                            type="button"
                            id="vei_load_meta"
                            class="button"
                        >
                            Load Fields
                        </button>

                        <p class="description">
                            Kisi existing Video ka post ID enter karein.
                        </p>

                    </td>

                </tr>

            </table>


            <div id="vei_meta_area" style="display:none;">

                <table class="form-table">

                    <tr>

                        <th>
                            Video Embed Code Meta Key
                        </th>

                        <td>

                            <select
                                id="vei_embed_meta_key"
                                style="min-width:400px;"
                            >
                            </select>

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Tracking URL Meta Key
                        </th>

                        <td>

                            <select
                                id="vei_tracking_meta_key"
                                style="min-width:400px;"
                            >
                            </select>

                        </td>

                    </tr>

                </table>

            </div>


            <hr>


            <!--
            ----------------------------------------------------------
            Excel Upload
            ----------------------------------------------------------
            -->

            <h2>2. Upload Excel</h2>

            <form
                id="vei_import_form"
                enctype="multipart/form-data"
            >

                <table class="form-table">

                    <tr>

                        <th>
                            Excel / CSV File
                        </th>

                        <td>

                            <input
                                type="file"
                                id="vei_file"
                                name="vei_file"
                                accept=".xlsx,.xls,.csv"
                                required
                            >

                            <p class="description">
                                Supported: XLSX, XLS, CSV
                            </p>

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Post Status
                        </th>

                        <td>

                            <select id="vei_status">

                                <option value="draft">
                                    Draft
                                </option>

                                <option value="publish">
                                    Publish
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                            </select>

                        </td>

                    </tr>


                    <tr>

                        <th>
                            Duplicate Handling
                        </th>

                        <td>

                            <select id="vei_duplicate">

                                <option value="skip">
                                    Skip existing title
                                </option>

                                <option value="update">
                                    Update existing title
                                </option>

                                <option value="create">
                                    Always create new
                                </option>

                            </select>

                        </td>

                    </tr>

                </table>


                <p>

                    <button
                        type="submit"
                        id="vei_import_button"
                        class="button button-primary button-large"
                    >
                        Import Videos
                    </button>

                </p>

            </form>


            <!--
            ----------------------------------------------------------
            Progress
            ----------------------------------------------------------
            -->

            <div
                id="vei_progress_area"
                style="display:none;margin-top:30px;"
            >

                <h2>Import Progress</h2>

                <div style="
                    width:100%;
                    background:#eee;
                    height:25px;
                    border-radius:4px;
                    overflow:hidden;
                ">

                    <div
                        id="vei_progress"
                        style="
                            width:0%;
                            height:25px;
                            background:#2271b1;
                            color:#fff;
                            text-align:center;
                            line-height:25px;
                        "
                    >
                        0%
                    </div>

                </div>

                <p id="vei_status_text">
                    Preparing...
                </p>

            </div>


            <div
                id="vei_result"
                style="margin-top:20px;"
            >
            </div>

        </div>

    </div>
`,
  },
  {
    id: 'ai_node_express_api',
    name: 'Node.js / Express: REST API Auth Controller',
    language: 'javascript',
    projectType: 'nodejs',
    category: 'Node.js / Express',
    description: 'AI-generated Express auth controller with robotic comments, unnecessary multi-line breaks, console.logs, and naive JWT verification.',
    code: `/*
|--------------------------------------------------------------------------
| User Authentication Controller
|--------------------------------------------------------------------------
| Handles registration, login, and token generation for users.
|--------------------------------------------------------------------------
*/

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');

// ============================================================================
// Register User Function
// ============================================================================

exports.registerUser = async (
  req,
  res
) => {

  try {

    // Step 1: Read email from body
    const email =
      req.body.email;

    // Step 2: Read password from body
    const password =
      req.body.password;

    // Step 3: Read name from body
    const name =
      req.body.name;


    // Check if email is empty
    if (!email) {
      // Return 400 error
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if password is empty
    if (!password) {
      // Return 400 error
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }


    /*
     * Check if user already exists
     */
    const existingUser =
      await db.User.findOne({
        where: {
          email: email
        }
      });

    if (existingUser) {
      // User exists
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }


    /*
     * Hash password with salt 10
     */
    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );


    /*
     * Create user in database
     */
    const newUser =
      await db.User.create({
        email: email,
        password: hashedPassword,
        name: name
      });


    /*
     * Sign JWT token
     */
    const token =
      jwt.sign(
        {
          id: newUser.id,
          email: newUser.email
        },
        process.env.JWT_SECRET || 'default_secret',
        {
          expiresIn: '7d'
        }
      );


    // Return success response
    return res.status(201).json({
      success: true,
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {

    // Log error to console
    console.log(error);

    // Return 500 error
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });

  }

};
`,
  },
  {
    id: 'ai_react_hook',
    name: 'React / Next.js: Custom Debounced Storage Hook',
    language: 'typescript',
    projectType: 'react',
    category: 'React / Next.js',
    description: 'Typical AI-generated React hook featuring decorative banners, excessive token-level vertical breaks, and stating-the-obvious comments.',
    code: `/*
|--------------------------------------------------------------------------
| Custom Debounced Local Storage Hook
|--------------------------------------------------------------------------
*/

import {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

// ============================================================================
// Types Definition
// ============================================================================

export interface StorageOptions<T> {
  // Serializer function
  serialize?: (value: T) => string;
  // Deserializer function
  deserialize?: (value: string) => T;
  // Debounce interval in milliseconds
  delay?: number;
}

/*
|--------------------------------------------------------------------------
| Hook Implementation
|--------------------------------------------------------------------------
*/
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: StorageOptions<T>
) {
  // Step 1: Read value from local storage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get item from local storage
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Step 2: Create timer ref for debounce
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Step 3: Set value function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function
          ? value(storedValue)
          : value;

      // Save state
      setStoredValue(valueToStore);

      // Clear previous timeout if exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set debounced storage update
      timeoutRef.current = setTimeout(() => {
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }, options?.delay || 300);

    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  }, [key, storedValue, options?.delay]);

  // Return value and setter
  return [storedValue, setValue] as const;
}
`,
  },
  {
    id: 'ai_python_fastapi',
    name: 'Python / FastAPI: Data Ingestion & Sanitizer',
    language: 'python',
    projectType: 'python',
    category: 'Python / FastAPI',
    description: 'Python code with decorative docstrings, extreme multi-line arguments, obvious line-by-line comments, and naive typing.',
    code: `"""
==============================================================================
DATA TRANSFORMATION PIPELINE
==============================================================================
This module handles reading raw records, cleaning user attributes,
and writing out formatted telemetry reports.
==============================================================================
"""

import os
import sys
import json
import logging
from typing import (
    Dict,
    List,
    Optional,
    Any,
    Union
)

# Set up logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ----------------------------------------------------------------------------
# Record Cleaning Function
# ----------------------------------------------------------------------------

def clean_record(
    raw_record: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Cleans a single incoming record dictionary.

    Args:
        raw_record: The raw dictionary from input.

    Returns:
        The sanitized record or None if invalid.
    """
    # Check if raw_record is None
    if raw_record is None:
        # Return None if raw_record is empty
        return None

    # Step 1: Extract ID
    record_id = raw_record.get('id')

    # Step 2: Validate ID exists
    if not record_id:
        # Log missing ID warning
        logger.warning("Record missing required id field.")
        return None

    # Step 3: Extract and clean email
    raw_email = raw_record.get('email', '')
    cleaned_email = (
        str(raw_email).strip().lower()
        if raw_email
        else None
    )

    # Step 4: Extract tags
    raw_tags = raw_record.get('tags', [])
    cleaned_tags = [
        str(tag).strip()
        for tag in raw_tags
        if tag is not None
    ]

    # Step 5: Construct clean payload
    sanitized_payload = {
        'id': record_id,
        'email': cleaned_email,
        'tags': cleaned_tags,
        'is_verified': bool(raw_record.get('is_verified', False))
    }

    # Return sanitized record
    return sanitized_payload
`,
  },
  {
    id: 'ai_html_landing',
    name: 'Frontend / HTML & JS: Contact Form with Validation',
    language: 'html',
    projectType: 'vanilla_html',
    category: 'HTML / Vanilla JS',
    description: 'AI-written HTML/JavaScript with excessive comment dividers, redundant variable declarations, and messy inline style dumps.',
    code: `<!--
==============================================================================
CONTACT FORM SECTION COMPONENT
==============================================================================
-->

<div class="contact-section-container" style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">

  <!-- Section Title -->
  <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1a202c;">
    Contact Us
  </h2>

  <!-- Contact Form -->
  <form id="contactForm" onsubmit="handleFormSubmit(event)">

    <!-- Name Field Container -->
    <div style="margin-bottom: 16px;">
      <label for="userName" style="display: block; font-weight: 500; margin-bottom: 4px;">
        Your Name
      </label>
      <input
        type="text"
        id="userName"
        name="userName"
        placeholder="Enter your name"
        style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;"
        required
      />
    </div>

    <!-- Email Field Container -->
    <div style="margin-bottom: 16px;">
      <label for="userEmail" style="display: block; font-weight: 500; margin-bottom: 4px;">
        Email Address
      </label>
      <input
        type="email"
        id="userEmail"
        name="userEmail"
        placeholder="Enter your email"
        style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;"
        required
      />
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      id="submitBtn"
      style="background-color: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;"
    >
      Send Message
    </button>

  </form>

  <!-- Status Message Container -->
  <div id="formStatus" style="margin-top: 16px; display: none;"></div>

</div>

<script>
/*
|--------------------------------------------------------------------------
| Form Submission Handler
|--------------------------------------------------------------------------
*/

function handleFormSubmit(
  event
) {

  // Prevent default page reload
  event.preventDefault();

  // Step 1: Get name input element
  const nameInput =
    document.getElementById('userName');

  // Step 2: Get email input element
  const emailInput =
    document.getElementById('userEmail');

  // Step 3: Get value
  const name =
    nameInput.value.trim();

  // Step 4: Get email value
  const email =
    emailInput.value.trim();


  // Step 5: Check empty
  if (!name || !email) {
    // Show error
    alert('Please fill out all fields.');
    return;
  }

  // Set submitting status
  const statusEl =
    document.getElementById('formStatus');

  statusEl.style.display =
    'block';

  statusEl.innerHTML =
    '<p style="color: #10b981;">Message sent successfully!</p>';

}
</script>
`,
  },
  {
    id: 'ai_sql_queries',
    name: 'Database / SQL: Analytics Query with AI Sprawl',
    language: 'sql',
    projectType: 'sql',
    category: 'SQL / Database',
    description: 'AI-generated SQL query with excessive line-breaks per column, robotic comment headers, and unindexed filter patterns.',
    code: `/*
==============================================================================
MONTHLY USER REVENUE AND CHURN AGGREGATION QUERY
==============================================================================
Calculates the recurring revenue and user activity per subscription tier.
==============================================================================
*/

-- Step 1: Select columns from users and orders
SELECT
    u.id AS user_id,
    u.email AS user_email,
    u.created_at AS registered_date,
    u.subscription_tier,
    COUNT(
        o.id
    ) AS total_orders_count,
    SUM(
        o.amount
    ) AS total_revenue_usd,
    AVG(
        o.amount
    ) AS average_order_value,
    MAX(
        o.created_at
    ) AS last_order_timestamp

-- Step 2: Join users table with orders table
FROM
    users AS u

LEFT JOIN
    orders AS o
    ON
    u.id = o.user_id

-- Step 3: Filter deleted and inactive records
WHERE
    u.is_deleted = FALSE
    AND
    u.status = 'active'
    AND
    o.payment_status = 'completed'

-- Step 4: Group results by user details
GROUP BY
    u.id,
    u.email,
    u.created_at,
    u.subscription_tier

-- Step 5: Sort by highest revenue
ORDER BY
    total_revenue_usd DESC;
`,
  },
];
