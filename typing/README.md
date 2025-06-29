# Typing Animation Script 📝

> [!NOTE]
> ai generate readme.md file btw, im just public code
> not have time to typing it out sorry!

A customizable typing animation script written in Python. This script simulates typing effects, complete with optional typos and cursor blinking, allowing for more dynamic output in your projects.

## Features ✨

- **Typing Simulation**: Simulates typing text with a customizable speed and random typos.
- **Cursor Blinking**: Adds an optional cursor that blinks while text is being typed.
- **Customizable Typo Behavior**: Randomly introduces typos based on user-defined chance and maximum number of typos.
- **Realistic Speed**: You can adjust the typing speed, with random variations, for a more natural feel.
- **Supports Special Characters**: Handles special characters, punctuation, and even non-ASCII characters.
- **No Dependency on External Libraries**: This script relies only on built-in Python libraries.

## Table of Contents 📚

- [Typing Animation Script 📝](#typing-animation-script-)
  - [Features ✨](#features-)
  - [Table of Contents 📚](#table-of-contents-)
  - [Installation ⚙️](#installation-️)
  - [Usage 🔧](#usage-)
    - [Parameters:](#parameters)
  - [How It Works ⚡](#how-it-works-)
  - [Customization ⚙️](#customization-️)
  - [Examples 📚](#examples-)

## Installation ⚙️

To use this script, you’ll need Python installed. Follow these steps to get started:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/aitji/tools
    cd tools/typing-animation
    ```

2. **Install Python**:
    Ensure you have Python 3.6 or higher installed. You can download Python from [python.org](https://www.python.org/).

3. **Run the script**:
    Once Python is installed, you can run the `testcase.py` file to see the typing animation in action:
    ```bash
    python testcase.py
    ```

## Usage 🔧

You can run the script in a Python environment to see the typing effect on any text.

- The script allows customization of speed, typos, and cursor behavior. You can modify the parameters in the `typing()` function to suit your needs.

### Parameters:
- `text`: The text you want to simulate typing.
- `min_speed`: The minimum speed of typing (default: 0.05 seconds per character).
- `max_speed`: The maximum speed of typing (default: 0.2 seconds per character).
- `typo_chance`: The chance of a typo happening during typing (default: 0.05).
- `show_cursor`: Whether or not to show the blinking cursor (default: `True`).
- `no_typos`: If set to `True`, the script will not introduce typos (default: `False`).

## How It Works ⚡

1. **Typing Simulation**: 
    The `typing()` function types each character in the string with random delays between characters, creating a natural typing effect.

2. **Typos and Speed Customization**:
    - You can adjust the likelihood of typos appearing in the text using `typo_chance`.
    - The typing speed is randomized between the `min_speed` and `max_speed` parameters for more variation.

3. **Cursor Blinking**:
    - If enabled, the cursor (`|`) blinks between characters, adding a more realistic typing effect.
    - The cursor blinks three times at the end of the typing.

4. **Error Handling**:
    - If an error occurs in the process (e.g., an invalid character is entered), the script will handle it gracefully and continue typing.

## Customization ⚙️

You can easily modify the script to suit your preferences:

- **Change Typo Behavior**: Adjust the `max_typos` and `typo_chance` to control how often typos happen.
- **Speed Customization**: Fine-tune the typing speed with `min_speed` and `max_speed`.
- **Cursor Behavior**: Toggle the cursor with `show_cursor` and adjust the blink rate as needed.

## Examples 📚

To see the typing effect in action, here are some sample texts you can try:

- "This is a typing animation test!"
- "It will introduce typos randomly."
- "You can adjust the speed of typing."
- "Special characters like !@#$%^&*() are supported!"