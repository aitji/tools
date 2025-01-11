##########################################
# Typing Animation Script                #
# @author: https://github.com/aitji      #
#                                        #
# NOTE Rename this file to anything else #
##########################################

import time
import random

def typing(text, min_speed=0.05, max_speed=0.2, typo_chance=0.05, show_cursor=True, no_typos=False):
    typed_text = ""
    cursor = "|" if show_cursor else ""
    typo_count = 0
    max_typos = min(8, max(3, len(text) // 15))

    def blink_cursor(displayed_text):
        if not show_cursor:
            return
        for _ in range(3):
            print(f"\r{displayed_text + cursor}", end="", flush=True)
            time.sleep(0.4)
            print(f"\r{displayed_text} ", end="", flush=True)
            time.sleep(0.4)

    for char in text:
        if char == "\n":
            typed_text += "\n"
            print(f"\r{typed_text + cursor}", end="", flush=True)
            time.sleep(random.uniform(min_speed, max_speed))
            continue

        if char.isdigit():
            if not no_typos and typo_count < max_typos and random.random() < typo_chance:
                typo = str(random.randint(0, 9))
                print(f"\r{typed_text + typo + cursor}", end="", flush=True)
                time.sleep(random.uniform(min_speed, max_speed))
                time.sleep(0.4)

                print(f"\r{typed_text + ' ' * len(typo)}", end="", flush=True)
                time.sleep(0.3)

                typo_count += 1
            typed_text += char
            print(f"\r{typed_text + cursor}", end="", flush=True)
            time.sleep(random.uniform(min_speed, max_speed))

        elif char in "!@#$%^&*()_+-=[]{}|;:'\"\\,.<>?/":
            typed_text += char
            print(f"\r{typed_text + cursor}", end="", flush=True)
            time.sleep(random.uniform(min_speed, max_speed))

        elif not char.isascii():
            typed_text += char
            print(f"\r{typed_text + cursor}", end="", flush=True)
            time.sleep(random.uniform(min_speed, max_speed))

        else:
            if not no_typos and typo_count < max_typos and random.random() < typo_chance:
                typo_length = random.randint(1, 2)
                typo = ''.join(
                    chr(random.randint(65, 90) if char.isupper() else random.randint(97, 122))
                    for _ in range(typo_length)
                )
                print(f"\r{typed_text + typo + cursor}", end="", flush=True)
                time.sleep(random.uniform(min_speed, max_speed))

                time.sleep(0.4)

                for _ in range(len(typo)):
                    print(f"\r{typed_text + typo[:len(typo)-1]}{' ' * (len(typo)-1)}", end="", flush=True)
                    typo = typo[:-1]
                    time.sleep(0.05)

                time.sleep(0.3)

                typo_count += 1
            typed_text += char
            print(f"\r{typed_text + cursor}", end="", flush=True)
            time.sleep(random.uniform(min_speed, max_speed if len(char) > 1 else min_speed * 0.7))

    blink_cursor(typed_text)

    print(f"\r{typed_text} ")