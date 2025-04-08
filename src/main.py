import os
import time
import requests
import sys

url = os.getenv('INPUT_URL')
max_attempts = int(os.getenv('INPUT_MAX-ATTEMPTS', '1'))
retry_delay = int(os.getenv('INPUT_RETRY-DELAY', '10000')) / 1000  # convert to seconds
expect_status = int(os.getenv('INPUT_EXPECT-STATUS', '200'))

print(f"Waiting for {url} to return status {expect_status}")

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