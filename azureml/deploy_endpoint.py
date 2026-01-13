# from azure.ai.ml import MLClient
# from azure.identity import DefaultAzureCredential
# from azure.ai.ml.entities import (
#     ManagedOnlineEndpoint,
#     ManagedOnlineDeployment,
#     Model,
#     Environment,
#     CodeConfiguration
# )

# ml_client = MLClient(
#     DefaultAzureCredential(),
#     subscription_id="e8b89d93-ad89-4f94-b45c-ff59510a44d3",
#     resource_group_name="retail-reco-rg",
#     workspace_name="retail-reco-ml"
#     # subscription_id="SUB_ID",
#     # resource_group_name="RG",
#     # workspace_name="WS"
# )

# endpoint = ManagedOnlineEndpoint(
#     name="retail-ranker",
#     auth_mode="key"
# )

# ml_client.begin_create_or_update(endpoint)

# deployment = ManagedOnlineDeployment(
#     name="blue",
#     endpoint_name=endpoint.name,
#     model=Model(path="./"),
#     environment=Environment(
#         conda_file="environment.yml",
#         image="mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04"
#     ),
#     code_configuration=CodeConfiguration(
#         code="./",
#         scoring_script="score.py"
#     ),
#     instance_type="Standard_DS3_v2",
#     instance_count=1
# )

# ml_client.begin_create_or_update(deployment)


import os
from azure.ai.ml import MLClient
from azure.identity import DefaultAzureCredential
from azure.ai.ml.entities import (
    ManagedOnlineEndpoint,
    ManagedOnlineDeployment,
    Model
)

# 🔴 CHANGE THESE (EXACT NAMES FROM AZURE PORTAL)
# IMPORTANT: Move these to environment variables in production!
# Use: os.getenv("AZURE_SUBSCRIPTION_ID")
SUBSCRIPTION_ID = os.getenv("AZURE_SUBSCRIPTION_ID", "YOUR_SUBSCRIPTION_ID")
RESOURCE_GROUP = os.getenv("AZURE_RESOURCE_GROUP", "YOUR_RESOURCE_GROUP")
WORKSPACE_NAME = os.getenv("AZURE_WORKSPACE_NAME", "YOUR_WORKSPACE_NAME")

ml_client = MLClient(
    DefaultAzureCredential(),
    SUBSCRIPTION_ID,
    RESOURCE_GROUP,
    WORKSPACE_NAME
)

# 1️⃣ Register model (SAFE even if it exists)
model = Model(
    path=".",   # folder with pkl + score.py
    name="retail-ranker-final",
    type="custom_model"
)
ml_client.models.create_or_update(model)

# 2️⃣ Create NEW endpoint
endpoint = ManagedOnlineEndpoint(
    name="retail-ranker-final",
    auth_mode="key"
)

print("Creating endpoint...")
ml_client.begin_create_or_update(endpoint).result()

# 3️⃣ Create deployment
deployment = ManagedOnlineDeployment(
    name="blue",
    endpoint_name="retail-ranker-final",
    model=model,
    environment={
        "image": "mcr.microsoft.com/azureml/openmpi4.1.0-ubuntu20.04",
        "conda_file": "environment.yml"
    },
    scoring_script="score.py",
    instance_type="Standard_DS2_v2",  # SAFE SKU
    instance_count=1
)

print("Creating deployment...")
ml_client.begin_create_or_update(deployment).result()

# 4️⃣ Route traffic
ml_client.online_endpoints.begin_update(
    name="retail-ranker-final",
    traffic={"blue": 100}
).result()

print("✅ Endpoint deployed successfully")
