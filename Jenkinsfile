pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
        // Update this path to match your Jenkins server's vercel.cmd location!
        VERCEL_PATH = 'C:\\Users\\jenkins\\AppData\\Roaming\\npm\\vercel.cmd'
        NPM_PATH = 'npm.cmd' // Or full path like 'C:\\Program Files\\nodejs\\npm.cmd'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                cleanWs()
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: env.REPO_URL]]
                ])
                echo 'Code checked out successfully'
                
                // Debug: Show directory structure
                bat 'dir /b'
            }
        }
        
        stage('Verify Files') {
            steps {
                script {
                    def requiredFiles = ['index.html', 'game.js', 'style.css', 'vercel.json']
                    def missingFiles = []
                    
                    requiredFiles.each { file ->
                        if (!fileExists(file)) {
                            missingFiles.add(file)
                        }
                    }
                    
                    if (missingFiles) {
                        error("Missing required files: ${missingFiles.join(', ')}")
                    } else {
                        echo 'All required files present'
                    }
                }
            }
        }
        
        stage('Setup Environment') {
            steps {
                bat """
                    echo "Node.js version:"
                    node --version
                    echo "npm version:"
                    ${env.NPM_PATH} --version
                    echo "Installing Vercel CLI..."
                    ${env.NPM_PATH} install -g vercel@latest
                    echo "Vercel path: %VERCEL_PATH%"
                    dir /s /b "%VERCEL_PATH%"
                """
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                script {
                    try {
                        // Deploy with explicit path
                        def deployOutput = bat(
                            script: """
                                "%VERCEL_PATH%" --prod --token %VERCEL_TOKEN% --confirm
                            """,
                            returnStdout: true
                        ).trim()
                        
                        // Parse deployment URL (supports both vercel.app and now.sh)
                        def deploymentUrl = deployOutput.split('\n').find { 
                            it.contains('https://') && (it.contains('vercel.app') || it.contains('now.sh'))
                        }?.trim()
                        
                        if (deploymentUrl) {
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            env.DEPLOYMENT_URL = deploymentUrl
                            echo "✅ Deployment successful: ${deploymentUrl}"
                        } else {
                            error("Could not extract deployment URL from output")
                        }
                    } catch (err) {
                        echo "❌ DEPLOY FAILED: ${err.getMessage()}"
                        error("Deployment failed")
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed - see logs for details"
        }
        success {
            echo "✅ Success! Deployed to: ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}