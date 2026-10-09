# Railway account & project

Railway CLI deployments for this repo require the account below. If `railway whoami`
shows a different account, run `railway logout` then `railway login` and sign in
with:

- **Account email:** drenajennifer375@gmail.com
- **Account name:** Drena Jennifer

## Project

- **Project:** Nexus Application Portal
- **Project ID:** a6263c0a-0bb7-4ea3-8d9b-327464ae2e61
- **Workspace:** Drena Jennifer's Projects (82d5b809-6950-4c2c-8d8f-9245063166b3)
- **Environment:** production (ea6128e9-3d4a-4a01-b74a-e25eace2d93b)

## Services

| Service | ID | Domain |
|---------|----|--------|
| backend | 81f41101-d879-4a00-aeec-f1ffee30b34e | backend-production-b8c2b.up.railway.app |
| nap-ml-service | a743b1e9-e874-4e0f-93a5-81793f7c2334 | nap-ml-service-production.up.railway.app |
| admissions-backend | 7d4c8808-85a7-449c-ac30-6f3ca82cf79b | admissions-backend-production-0985.up.railway.app |
| Postgres | 5f89f53f-54f3-4819-b6cb-926431f55266 | - |
| Postgres-qnmR | 03c2e5a9-f02f-447e-8e10-b062d8ae1dc5 | - |

## Local link

`NAP-ML-Service/` is linked to the **nap-ml-service** service in the production
environment. Deploy the ML service with:

```bash
railway up            # from NAP-ML-Service/
```

The service persists its index on a volume mounted at `/data`
(`nap-ml-service-volume`, id 86081243-f4c2-409b-b62b-88de2279d07c).
