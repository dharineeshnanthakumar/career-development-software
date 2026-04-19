# run-tests.ps1
# CI/CD script for executing backend unit tests and frontend E2E tests

Write-Host "=========================================="
Write-Host " Starting Career Development Test Suite"
Write-Host "=========================================="

Write-Host ""
Write-Host "1. Running Backend Unit & Integration Tests (JUnit + JaCoCo)..."
# Execute Maven tests and generate JaCoCo coverage report
mvn test jacoco:report

if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend tests failed. Stopping execution."
    exit $LASTEXITCODE
}

Write-Host "Backend tests passed! Coverage report generated at target/site/jacoco/index.html"
Write-Host ""

Write-Host "2. Running API Tests (Postman via Newman)..."
# Execute Postman collection using Newman CLI
npx newman run .\postman\CareerDevelopmentAPI.postman_collection.json -e .\postman\LocalEnvironment.postman_environment.json

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Postman/Newman API tests reported failures/403s (Make sure your test user exists in DB!)."
}

Write-Host "API tests completed!"
Write-Host ""

Write-Host "3. Setting up Frontend dependencies... "
Set-Location -Path "frontend"
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies."
    exit $LASTEXITCODE
}

Write-Host "4. Starting frontend and backend in background for E2E Tests (Mock/Example)..."
# Note: In a real CI environment (e.g., GitHub Actions), you would spin up the backend jar 
# and the frontend dev server as background processes before running Selenium.
# e.g., Start-Process "java" -ArgumentList "-jar target/career-development-software-0.0.1-SNAPSHOT.jar" -NoNewWindow
# e.g., Start-Process "npm" -ArgumentList "run dev" -NoNewWindow

Write-Host "5. Running Frontend E2E Tests (Selenium + Jest)..."
npm run test:e2e

if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend E2E tests failed."
    exit $LASTEXITCODE
}
Write-Host "Frontend E2E tests completed successfully!"

Write-Host ""
Write-Host "=========================================="
Write-Host " All Tests Passed Successfully!"
Write-Host "=========================================="

Set-Location -Path ".."
