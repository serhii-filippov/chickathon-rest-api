module.exports = (req, res, jarFilePath) => {

    const path = require('path');
    const fs = require('fs');
    const archiver = require('archiver');

    const bareFileName = path.basename(jarFilePath);
    const bareFilePath = path.dirname(jarFilePath);

    const filePath = path.join(bareFilePath, bareFileName.split('.')[0] + '.zip');
    const output = fs.createWriteStream(filePath);
    const input = fs.createReadStream(jarFilePath)
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });
    
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    
    output.on('end', function() {
        console.log('Data has been drained');
    });
    
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.log('Error during bot source file archivating occured', err);
        } else {
            throw err;
        }
    });
    
    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    archive.pipe(output);
    const file1 = __dirname + '/file1.txt';
    // fs.appendFileSync(file1);
    archive.append(fs.createReadStream(jarFilePath), { name: bareFileName });
    archive.pipe(res);
    archive.finalize();
}