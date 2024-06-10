const defineConfig = (o) => o 

const serviceName = 'vame'
const serviceBuildRoot = `./build/python`
const pythonSrc = './src/backend/app.py'

const toCollect = [ 'numpy' ]

export default defineConfig({

    name: "VAME",
    target: 'desktop',
    appId: 'com.gladstoneinstitutes.vame',
    
    
    icon: './logo.png', 

    electron: {
        window: {
            width: 1200, // Adjust default width
            height: 800, // Adjust default height
            minHeight: 600, // Adjust minimum height
        }
    },

    services: {

        // Packaged with pyinstaller
        [serviceName]: {
            description: 'A simple Python service for VAME',
            src: pythonSrc,
            publish: {
                build: `python -m PyInstaller --name ${serviceName} --onedir --clean ${pythonSrc} --distpath ${serviceBuildRoot} ${toCollect.map(pkg => `--collect-all ${pkg}`).join(' ')}`,
                local: {
                    src: serviceName,
                    base: `${serviceBuildRoot}/${serviceName}`, // Will be copied
                }
            }
        }
        
    }
})