import os
import time
import requests
import sys
import re

def parse_duration(value):
    value = str(value).strip().lower()
    if value.endswith("ms"):
        return float(value[:-2]) / 1000
    elif value.endswith("s"):
        return float(value[:-1])
    elif value.endswith("m"):
        return float(value[:-1]) * 60
    else:
        # Assume milliseconds if just a number
        return float(value) / 1000

url = os.getenv('INPUT_URL')
max_attempts = int(os.getenv('INPUT_MAX-ATTEMPTS', '1'))
retry_delay_raw = os.getenv('INPUT_RETRY-DELAY', '10000')
expect_status = int(os.getenv('INPUT_EXPECT-STATUS', '200'))

try:
    retry_delay = parse_duration(retry_delay_raw)
except Exception as e:
    print(f"❌ Failed to parse retry-delay '{retry_delay_raw}': {e}")
    sys.exit(1)

print(f"🔁 Will check {url} for status {expect_status}, up to {max_attempts} times, every {retry_delay} seconds.")

for attempt in range(1, max_attempts + 1):
    try:
        response = requests.get(url)
        if response.status_code == expect_status:
            print(f"✅ Success: Got expected status code {expect_status}")
            sys.exit(0)
        else:
            print(f"Attempt {attempt}: Expected {expect_status} but got {response.status_code}")
    except Exception as e:
        print(f"Attempt {attempt}: Error accessing URL - {e}")

    if attempt < max_attempts:
        time.sleep(retry_delay)

print(f"❌ Failed: {url} did not return {expect_status} after {max_attempts} attempts")
sys.exit(1)