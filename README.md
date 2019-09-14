# Simple Admin
A chrome extension designed to make searching the SCCRM admin portal easier. 

This project uses Webpack & Babel to compile modules and transpile ES6 down to ES5 compatible code.

After cloning, use `npm install` to download this project's dependencies. 

To build the extension, use `npm run build`. This will create a build folder in the project's root directory
if one doesn't already exist and dump the output from Babel into it. 

To add the extension to Chrome, navigate to More Tools → Extensions and turn on development mode in the upper right hand corner. Next, click the 'Choose Upload' button and select the build folder (not the root directory).


