# ssdp-chrome
A ssdp backend for chrome, usable from both webpages and extensions

## Usage
This project consists of two parts, a chrome app and a chrome extension. This is because chrome does not allow extensions to use the chrome.sockets.udp interfaces, only Apps.

The App does two things. First, it creates a udp socket and sends out requests ssdp requests periodically. It also listens for requests from other extensions or webpages through chrome's Message Passing system.

The extension is currently set up so that when you navigate to a twitch.tv live stream, it will request available devices from the backend and display them by the stream description. The extension comes with a small library (ssdp.js) that hides the actual message handling that occurs.

## Installation

The app and the extension can be installed by activating the developer mode for chrome, and then installing both folders as unpacked extensions. Take note of the ID for the SSDP App, you may have to change the corresponding variable in the ssdp library.

IMPORTANT: Because twitch is https and the example will be trying to send an http post request to your roku, you must click the shield in the upper right hand corner of your address bar and allow the script to connect to your roku. Otherwise the stream won't play on the roku.
