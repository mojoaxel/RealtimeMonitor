# RealtimeMonitor

![image](https://user-images.githubusercontent.com/600565/82145106-c5b0ff80-9848-11ea-9043-ef1362be8f70.png)

## Setup

### Requirements

* [`node` and `npm`](https://nodejs.org/)
* [vnstat](https://linux.die.net/man/1/vnstat)

### Setup

```
npm install
``` 

## Setings
```
cp settings_example.json settings.json
```
* **port**: start webserver in this port
* **ifaces**: filter the given interfaces.

## Run

```
node app.js
```
oder
```
nodemon app.js
```

## License

This software is released under the [AGPL-3.0 license](https://www.gnu.org/licenses/agpl-3.0.de.html).
