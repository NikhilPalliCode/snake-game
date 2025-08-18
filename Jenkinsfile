pipeline {
    agent any
    
    environment {
        // Use generic CI identity
        GIT_NAME = 'CI Bot'
        GIT_EMAIL = 'ci-bot@users.noreply.github.com'
        REPO_URL = 'https://github.com/NikhilPalliCode/snake-game.git'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    extensions: [[
                        $class: 'CleanBeforeCheckout'
                    ]],
                    userRemoteConfigs: [[
                        url: env.REPO_URL,
                        credentialsId: 'github-ssh-key' // Recommended: Use SSH key
                    ]]
                ])
            }
        }
        
        stage('Deploy to GH Pages') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh '''
                        # Configure anonymous git identity
                        git config user.name "${GIT_NAME}"
                        git config user.email "${GIT_EMAIL}"
                        
                        # Create orphan branch (no history)
                        git checkout --orphan gh-pages
                        
                        # Keep only necessary files
                        shopt -s extglob
                        rm -rf !(index.html|style.css|game.js)
                        
                        # Commit and push
                        git add -f index.html style.css game.js
                        git commit -m "Automated deployment [skip ci]"
                        git push -f https://${GIT_TOKEN}@github.com/${GIT_USER}/snake-game.git gh-pages
                    '''
                }
            }
        }
    }
}