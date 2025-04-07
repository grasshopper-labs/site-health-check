# 🚀 Site Health Check

A **GitHub Action** for monitoring website health by making an HTTP request to a specified URL.

## 🛠 Features
- ✅ Supports multiple retry attempts before failing  
- 🔄 Configurable retry delays  
- 🚦 Allows setting expected HTTP status codes  
- 🔗 Option to follow redirects  

---

## 📥 Inputs

| Parameter      | Required | Description |
|---------------|:--------:|------------|
| `url`         | ✅ Yes   | URL of the website to check |
| `max-attempts` | ❌ No   | Number of retries before failing (default: `1`) |
| `retry-delay`  | ❌ No   | Delay between retries in **milliseconds** (default: `10000` ms) |
| `expect-status`  | ❌ No | Expected HTTP status code (default: `200`) |

---

## 📌 Example Usage

```yaml
jobs:
  health_check:
    runs-on: ubuntu-latest
    steps:
      - name: 🔍 Check Site Health
        uses: grasshopper-labs/site-health-check@v2.0.0
        with:
          url: "https://domain.com/health/"
          max-attempts: 6
          retry-delay: 10000
          expect-status: 200
```

---

## ✅ How It Works
1. The action makes an HTTP request to the given `url`.  
2. If the response **does not match** `expect-status`, it retries up to `max-attempts` times.  
3. If all attempts fail, the action **fails the job**.  

---

## 📜 License
This project is licensed under the MIT License.
