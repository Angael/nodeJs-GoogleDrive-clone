# nodeJs-GoogleDrive-clone
Node js google drive clone, that uses firebase for authentication, sequelize with postgresql, multer and saves files locally

This is a learning project, that would require serious rewrite in order to be usable.<br>
Working app consists of node.js server, postgresql server and firebase project connected to it.


Downloading this repository is not recommended, because of project setup complexity ( firebase project, config folder creation, postgresql setup )


Node.js server uses: 
- express,
- firebase (secure authentication, so as to not handle users credentials in this learning project),
- sequelize (connecting to postgresql server), 
- multer (accepting file uploads and saving), 
- webpack (modularization), 
- archiver (bundling files into an archive on downloading), 
- pug (dynamic and easy html), 
- scss (nice css)
- sharp (image resizing for thumbnails)
