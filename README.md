# Site Health Check

Simple site health check that makes an HTTP request to provided URL.

## Inputs

| label | required |    Description |
| ----- | :------: | -------------: |
| url   |   yes    | URL of website |

## Example Usage

```
      - name: Check Site Health
        uses: grasshopper-labs/site-health-check@v1.0.5
        with:
          url: "https://domain.com/health/"
          max-attempts: 6
          retry-delay: 10s
          follow-redirect: true
          expect-status: 200
```
