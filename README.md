
Deployment process:

ASS0: each environment (development, staging, production, etc) gets its own API and corresponding dns name (development.api.intelos.io, staging.api.intelos.io, api.intelos.io, etc).
ASS1: a stage corresponds to a top-level directory under the top-level repository src directory.
ASS2: each 2nd level directory and below under the src directory corresponds to a resource in the api in a particular stage.
ASS4: a deployment is a function of: 1) environment, 2) stage, 3) ???.

Q1: how do we know when a lambda function needs to be updated?
Q2: if we delete an endpoint that has methods associated with it, will the methods be deleted as well?
Q3: how do we manage different api versions? each version is a branch in the git repo? is there a case for having a separate repo for each version? v1, v2, etc.
Q4: each version can then be deployed to multiple staging/testing/production environments. i.e. test v1 in staging. how will that work? api.staging.intelos.io/v1 vs. api.dev.intelos.io/v1 vs. api.intelos.io/v1.
A4: see ASS0 and ASS4.

1. Build everything into dist (via gulp)
    a. transpile js using babel
    b. npm install in each endpoint directory
2. Deploy
    0. create the api gateway if it doesn't already exist (use environment and name as the lookup key).
    a. create endpoints in api gateway
        i. Get list of existing resources and methods in api gateway.
        ii. Get list of resources/methods that need to be created and create them (diff between what we have and what api gateway has).
        iii. Get list of resources/methods in api gateway that are no longer needed (diff our defs - api gateway list) and delete them.
    b. create corresponding lambda functions
        i. Get list of existing lambda functions
        ii. Get list of lambda functions that need to be created and create them.
        iii. Get list of lambda functions that need to be updated and update them.
        iv. Get list of lambda functions that are no longer needed and delete them.
    c. give endpoints created in (a) permission to execute the corresponding lambda functions created in (b)
    d.
