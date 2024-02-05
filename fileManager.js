const fs = require('fs');
const os = require('os');
const zlib = require('zlib');
const readline = require('readline');
const crypto = require('crypto');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'FileManager> '
});



const args = process.argv.slice(2);
const parsedArgs = {};
args.forEach(arg => {
    if (arg.startsWith('--')) {
        const [key, value] = arg.substring(2).split('=');
        parsedArgs[key] = value || true;
    }
});
const username = parsedArgs.username;

let currentPath = os.homedir();

function printCurrentPath() {
    console.log(`You are currently in ${currentPath}`);
}

function printWelcomeMessage() {
    console.log(`Welcome to the File Manager, ${username}!`);
}

function printGoodbyeMessage() {
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
}


function listFilesAndFolders() {
    printCurrentPath();
    const items = fs.readdirSync(currentPath).sort();

    console.log('Index  |    Type    |   Name');
    console.log('------------------------------');

    items.forEach((item, index) => {
        const fullPath = `${currentPath}/${item}`;
        const type = fs.statSync(fullPath).isDirectory() ? 'Folder' : 'File';
        const formattedIndex = index.toString().padEnd(5);
        const formattedName = item.padEnd(25); // Adjust the padding as needed
        console.log(`${formattedIndex}  |  ${type.padEnd(10)}| ${formattedName}`);
    });
}



function changeDirectory(path) {
    const newPath = path.startsWith('/') ? path : `${currentPath}/${path}`;

    if (fs.existsSync(newPath) && fs.statSync(newPath).isDirectory()) {
        currentPath = newPath;
        printCurrentPath();
    } else {
        console.log('Invalid path or directory does not exist.');
    }
}

function readFileContent(filePath) {
    const fullPath = `${currentPath}/${filePath}`;

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        printCurrentPath();
        const stream = fs.createReadStream(fullPath);
        stream.pipe(process.stdout);
    } else {
        console.log('Invalid file path or file does not exist.');
    }
}

function copyFile(sourcePath, destinationPath) {
    const sourceFullPath = `${currentPath}/${sourcePath}`;
    const destinationFullPath = `${currentPath}/${destinationPath}`;

    if (fs.existsSync(sourceFullPath) && fs.statSync(sourceFullPath).isFile()) {
        const readStream = fs.createReadStream(sourceFullPath);
        const writeStream = fs.createWriteStream(destinationFullPath);

        readStream.pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`File copied: ${sourcePath} -> ${destinationPath}`);
        });

        writeStream.on('error', (err) => {
            console.log('Error copying file:', err.message);
        });
    } else {
        console.log('Invalid source file path or file does not exist.');
    }
}

function moveFile(sourcePath, destinationPath) {
    const sourceFullPath = `${currentPath}/${sourcePath}`;
    const destinationFullPath = `${currentPath}/${destinationPath}`;

    if (fs.existsSync(sourceFullPath) && fs.statSync(sourceFullPath).isFile()) {
        fs.renameSync(sourceFullPath, destinationFullPath);
        console.log(`File moved: ${sourcePath} -> ${destinationPath}`);
    } else {
        console.log('Invalid source file path or file does not exist.');
    }
}

function deleteFile(filePath) {
    const fullPath = `${currentPath}/${filePath}`;

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
        console.log(`File deleted: ${filePath}`);
    } else {
        console.log('Invalid file path or file does not exist.');
    }
}

function renameFile(oldPath, newPath) {
    const oldFullPath = `${currentPath}/${oldPath}`;
    const newFullPath = `${currentPath}/${newPath}`;

    if (fs.existsSync(oldFullPath) && fs.statSync(oldFullPath).isFile()) {
        fs.renameSync(oldFullPath, newFullPath);
        console.log(`File renamed: ${oldPath} -> ${newPath}`);
    } else {
        console.log('Invalid file path or file does not exist.');
    }
}

function goUp() {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');

    if (parentPath !== '') {
        currentPath = parentPath;
        printCurrentPath();
    } else {
        console.log('You are already in the root directory.');
    }
}


function printEOL() {
    console.log(`End-Of-Line (EOL): ${os.EOL}`);
}

function printCPUsInfo() {
    const cpus = os.cpus();
    console.log('CPU Information:');
    console.log('-----------------');

    cpus.forEach((cpu, index) => {
        console.log(`CPU ${index + 1}:`);
        console.log(`  Model: ${cpu.model}`);
        console.log(`  Speed: ${cpu.speed / 1000} GHz`);
        console.log('-----------------');
    });

    console.log(`Total CPUs: ${cpus.length}`);
}

function printHomeDir() {
    console.log(`Home Directory: ${os.homedir()}`);
}

function printUsername() {
    console.log(`Current System User: ${os.userInfo().username}`);
}

function printArchitecture() {
    console.log(`CPU Architecture: ${os.arch()}`);
}


function calculateFileHash(filePath) {
    const fullPath = `${currentPath}/${filePath}`;

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const readStream = fs.createReadStream(fullPath);
        const hash = crypto.createHash('sha256');

        readStream.pipe(hash);

        hash.on('readable', () => {
            const data = hash.read();
            if (data) {
                console.log(`Hash for ${filePath}: ${data.toString('hex')}`);
            }
        });

        hash.on('end', () => {
            console.log('Hash calculation completed.');
        });
    } else {
        console.log('Invalid file path or file does not exist.');
    }
}


function compressFile(sourcePath, destinationPath) {
    const sourceFullPath = `${currentPath}/${sourcePath}`;
    const destinationFullPath = `${currentPath}/${destinationPath}.br`;

    if (fs.existsSync(sourceFullPath) && fs.statSync(sourceFullPath).isFile()) {
        const readStream = fs.createReadStream(sourceFullPath);
        const writeStream = fs.createWriteStream(destinationFullPath);
        const brotliStream = zlib.createBrotliCompress();

        readStream.pipe(brotliStream).pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`File compressed: ${sourcePath} -> ${destinationPath}.br`);
        });

        writeStream.on('error', (err) => {
            console.log('Error compressing file:', err.message);
        });
    } else {
        console.log('Invalid source file path or file does not exist.');
    }
}

function decompressFile(sourcePath, destinationPath) {
    const sourceFullPath = `${currentPath}/${sourcePath}`;
    const destinationFullPath = `${currentPath}/${destinationPath}`;

    if (fs.existsSync(sourceFullPath) && fs.statSync(sourceFullPath).isFile()) {
        const readStream = fs.createReadStream(sourceFullPath);
        const writeStream = fs.createWriteStream(destinationFullPath);
        const brotliStream = zlib.createBrotliDecompress();

        readStream.pipe(brotliStream).pipe(writeStream);

        writeStream.on('finish', () => {
            console.log(`File decompressed: ${sourcePath} -> ${destinationPath}`);
        });

        writeStream.on('error', (err) => {
            console.log('Error decompressing file:', err.message);
        });
    } else {
        console.log('Invalid source file path or file does not exist.');
    }
}


rl.on('line', (input) => {
    const [command, ...args] = input.trim().split(' ');


    switch (command) {
        case 'up':
            goUp();
            break;

        case 'ls':
            listFilesAndFolders();
            break;

        case 'cd':
            changeDirectory(args[0]);
            break;

        case 'cat':
            readFileContent(args[0]);
            break;


        case 'cp':
            copyFile(args[0], args[1]);
            break;

        case 'mv':
            moveFile(args[0], args[1]);
            break;

        case 'rm':
            deleteFile(args[0]);
            break;

        case 'rn':
            renameFile(args[0], args[1]);
            break;

        case 'compress':
            compressFile(args[0], args[1]);
            break;

        case 'decompress':
            decompressFile(args[0], args[1]);
            break;

        case 'hash':
            calculateFileHash(args[0]);
            break;

        case '--EOL':
            printEOL();
            break;

        case '--cpus':
            printCPUsInfo();
            break;

        case '--homedir':
            printHomeDir();
            break;

        case '--username':
            printUsername();
            break;

        case '--architecture':
            printArchitecture();
            break;


        case '.exit':
            printGoodbyeMessage();
            process.exit(0);
            break;

        default:
            console.log('Invalid input. Please enter a valid command.');
            break;
    }

    rl.prompt();
});


printWelcomeMessage();
printCurrentPath();
rl.prompt();
