const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { writeFile } = require('node:fs/promises');
const { stream, Readable } = require('node:stream');
const args = process.argv.slice(2);

// check if gtk is in default location
const gtkInCRoot = fs.existsSync(path.join("C:\\", "GTK"))

if(!gtkInCRoot || args.indexOf('--force-gtk-vendor') > -1) {

    (async () => {
        // download GTK sources and unzip to vendor folder

        if(!gtkInCRoot) {
            console.log('No GTK present in root');
        } else {
            console.log('Forcing GTK src to vendor');
        }

    
        const srcUrl = 'https://ftp.gnome.org/pub/GNOME/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip';    
        console.log('Fetching from', srcUrl);
        const response = await fetch(srcUrl);
        const fileData = Buffer.from(await response.arrayBuffer());                
        const sources = await unzipper.Open.buffer(fileData);
        const vendorPath = path.join(process.cwd(), 'data', 'vendor');
        const gtkPath = path.join(vendorPath, 'gtk');
        
        if(!fs.existsSync(vendorPath)) {
            console.log('No', vendorPath);
            fs.mkdirSync(vendorPath);

            if(!fs.existsSync(gtkPath)) {
                fs.mkdirSync(gtkPath);
            }
        }

        await sources.extract({
            path: gtkPath
        });
        
        if(fs.readdirSync(gtkPath).length > 0) {
            // files are present in gtk vendor
            console.log('\n\nSuccesfully installed GTK src in vendor folder');
        } else {
            console.error("Mistakes were made!");
        }        
    })();

}
