pipeline {
    agent any
    stages {
        stage('Deploy to GitHub Pages') {
            steps {
                bat '''
                    git checkout --orphan gh-pages
                    git rm -rf .
                    copy index.html .
                    copy style.css .
                    copy game.js .
                    git add .
                    git commit -m "Deploy to GitHub Pages"
                    git push origin gh-pages --force
                '''
            }
        }
    }
}