/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

 const fs = require('fs');
 const path = require('path');

 function removeDir(dirPath) {
     for (const ent of fs.readdirSync(dirPath)) {
         const entryPath = path.join(dirPath, ent);
         remove(entryPath);
     }

     fs.rmdirSync(dirPath);
 }

 function remove(entryPath) {
     const st = fs.statSync(entryPath);
     if (st.isDirectory())
         removeDir(entryPath);
     else
         fs.unlinkSync(entryPath);
 }

 const toClean = [
     path.resolve(__dirname, '../build'),
     path.resolve(__dirname, '../lib'),
     path.resolve(__dirname, '../tsconfig.tsbuildinfo'),
 ];

 toClean.forEach(ph => {
     if (fs.existsSync(ph)) {
         try {
             remove(ph);
         } catch (err) {
             console.warn(`Cleanup failed: ${err}`);
         }
     }
 });
