pipeline {
    agent any
    
    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        SLACK_CHANNEL = '#game-deploys'
    }
    
    stages {
        stage('Checkout Code') {
            steps {
                cleanWs()
                checkout scm
                bat 'dir /s /b' // Verify directory structure
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
        
        stage('Setup Vercel') {
            steps {
                bat '''
                    echo "=== Installing Vercel CLI ==="
                    npm install -g vercel@latest
                    
                    echo "=== Updating PATH ==="
                    for /f "delims=" %%a in ('npm prefix -g') do (
                        set NPM_GLOBAL=%%a
                        echo "Found npm global at: !NPM_GLOBAL!"
                    )
                    echo "Original PATH: %PATH%"
                    set PATH=%PATH%;%NPM_GLOBAL%
                    echo "Updated PATH: %PATH%"
                    
                    echo "=== Verifying Installation ==="
                    vercel --version || echo "Vercel verification failed"
                    where vercel
                '''
            }
        }
        
        stage('Deploy to Vercel') {
            steps {
                script {
                    try {
                        // Get the exact path to vercel
                        def vercelPath = bat(
                            script: 'where vercel',
                            returnStdout: true
                        ).trim()
                        
                        echo "Using Vercel at: ${vercelPath}"
                        
                        // Deploy with full path
                        def deployOutput = bat(
                            script: "\"${vercelPath}\" --prod --token %VERCEL_TOKEN% --confirm",
                            returnStdout: true
                        ).trim()
                        
                        // Extract deployment URL
                        def deploymentUrl = deployOutput.split('\n').find { 
                            it =~ /https:\/\/.*(vercel\.app|now\.sh)/
                        }?.trim()
                        
                        if (deploymentUrl) {
                            currentBuild.description = "Deployed: ${deploymentUrl}"
                            env.DEPLOYMENT_URL = deploymentUrl
                            echo "✅ Deployment successful: ${deploymentUrl}"
                        } else {
                            error("Could not extract deployment URL from output:\n${deployOutput}")
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
            echo "=== Pipeline completed ==="
            bat 'vercel logout || echo "Vercel logout failed"'
        }
        success {
            echo "✅ Successfully deployed to: ${env.DEPLOYMENT_URL}"
            // slackSend channel: env.SLACK_CHANNEL, 
            //            color: 'good', 
            //            message: "✅ Deployed: ${env.DEPLOYMENT_URL}"
        }
        failure {
            echo "❌ Pipeline failed"
            // slackSend channel: env.SLACK_CHANNEL,
            //            color: 'danger',
            //            message: "❌ Deployment failed - ${env.BUILD_URL}"
        }
    }
}