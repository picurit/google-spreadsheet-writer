# google-spreadsheet-writer

## Init project

npm init -y


## Clasp

clasp login
clasp logout

clasp pull

clasp push

clasp list-deployments

clasp delete-deployment --all
clasp delete-deployment AKfycbyWZkPMVmF0uGZcBoNIMUh7ZHiYKGsHOrEiXWLLuHZIH_2XL8pW6LpZtoAMyt5sKwAOPw

clasp create-deployment -V 1 -d "V1: Test Deployment"
clasp create-deployment -V 1 -d "V1: Test Deployment" -i AKfycbxSwrBLRGFkzBpzgZWMYpP3y_KrXxqC1ldl3HyWz80GUwm3uS3rpJ_9WMTLz6WWC77imA

clasp list-versions
clasp create-version "V5: Test Deployment"
clasp create-deployment -V 5
AKfycbwDMoZslm8mxOycYB067EH7DFOhxg8THLlYl7ITWxDwZ1ejj_9v0xja1tUHG6XIWhJk6Q



clasp delete-deployment
clasp create-version "V6: Test Deployment"


clasp create-deployment -V 6

## Documentation

npx create-docusaurus@latest docs classic

[SUCCESS] Created docs.
[INFO] Inside that directory, you can run several commands:

  `npm start`
    Starts the development server.

  `npm run build`
    Bundles your website into static files for production.

  `npm run serve`
    Serves the built website locally.

  `npm run deploy`
    Publishes the website to GitHub pages.

We recommend that you begin by typing:

  `cd docs`
  `npm start`

Happy building awesome websites!
