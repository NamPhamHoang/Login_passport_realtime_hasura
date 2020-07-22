// if(env.BRANCH_NAME ==~ /^PR-.*|master/) {

//     node('worker') {
//         stage('checkout') {
//             checkout scm
//             sh "sleep 2"
//         }
//         // stage('install_package') {
//         //     docker.image('node:10.17.0').inside {
//         //             sh "npm install"
//         //         }
//         // }

//         // stage('type_check') {
//         //   docker.image('node:10.17.0').inside {
//         //     sh "npm run tslint:prod"
//         //     sh "npm run tsc"
//         //   }
//         // }

//         // if(env.BRANCH_NAME == 'master') {
//         //   stage('build') {
//         //         docker.image('node:10.17.0').inside {
//         //           sh "npm run build"
//         //         }
//         //       }
//         // }
//         // stage('deliver') {
//         //   docker.image('node:10.17.0').inside {
//         //     sh "chmod +x ./bin/deliver-start.sh"
//         //     sh "chmod +x ./bin/deliver-stop.sh"
//         //     sh "./bin/deliver-start.sh"
//         //     input message: 'Finished using the checking site? (Click "Proceed" to continue)'
//         //     sh "./bin/deliver-stop.sh"
//         //   }
//         // }

//     }
// }

if(env.BRANCH_NAME == 'master') {
  node ('master') {
    checkout scm
    configFileProvider([configFile(fileId: 'sellthepeak_production.env', variable: 'ENV_FILE')]) {
        sh "mkdir -p ./.environments"
        sh "cp -rf $ENV_FILE ./.environments/production.env"
    }
    
    sh "chmod +x scripts/deploy.sh"
    sh "./scripts/deploy.sh"
    sh "docker-compose -f docker-compose.prod.yml up -d"
  }
}

if(env.BRANCH_NAME == 'staging') {
  node ('master') {
    checkout scm
    configFileProvider([configFile(fileId: 'sellthepeak_staging.env', variable: 'ENV_FILE')]) {
        sh "mkdir -p ./.environments"
        sh "cp -rf $ENV_FILE ./.environments/prod.env"
    }
    
    sh "chmod +x scripts/deploy.sh"
    sh "./scripts/deploy.sh"
    sh "docker-compose -f docker-compose.staging.yml up -d"
  }
}