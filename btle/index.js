

var characteristicHr;
var startButton;
var stopButton;
window.addEventListener("load", function(event) {
    console.log("Loaded...")
    startButton = document.querySelector("#startNotification");
    stopButton = document.querySelector("#stopNotification");
    startButton.addEventListener('click', () => {
        console.log("start notification")
        characteristicHr.startNotifications().then(char => 
        {
            characteristicHr.addEventListener('characteristicvaluechanged',handleHr)
        }); 
    })
    stopButton.addEventListener('click', () => {characteristicHr.stopNotifications(); })
   
    document.getElementById('button').addEventListener('click', function(event)
    {
        navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
            .then(device => {  
                    // Human-readable name of the device.
                    console.log(device.name);
                    // Filtered UUIDs of GATT services the website origin has access to.
                    console.log(device.uuids);

                    // Attempts to connect to remote GATT Server.
                    return device.gatt.connect(); 
            }).then(server => {
                // Getting Battery Service...
                return server.getPrimaryService('heart_rate');
            }).then(service => {
                // Getting Battery Level Characteristic...
               
                return  service.getCharacteristics();
            }).then(characteristics => {
            /* batteryLevelCharacteristic = characteristic;
             batteryLevelCharacteristic.addEventListener('characteristicvaluechanged',
                handleHr);*/
                characteristics.forEach((c) => { if (c.properties.notify){
                                                        characteristicHr = c;
                                                        console.log("Got characteristicHr",characteristicHr.name)
                                              
                                                    }
                                                });
            })

            
            .catch(error => { console.log(error); });
    })
  });


function handleHr(event)
{
    console.log('handlevalue')
    //event.target.then((data) => {console.log(data)});
    let characteristic = event.target;
    let result = parseHeartRate(characteristic.value)
    console.log(result);

    document.querySelector("#hr").innerHTML = result.heartRate + " bpm"  


}


function parseHeartRate(data) {
  let flags = data.getUint8(0);
  let rate16Bits = flags & 0x1;
  let result = {};
  let index = 1;
  if (rate16Bits) {
    result.heartRate = data.getUint16(index, /*littleEndian=*/true);
    index += 2;
  } else {
    result.heartRate = data.getUint8(index);
    index += 1;
  }
  let contactDetected = flags & 0x2;
  let contactSensorPresent = flags & 0x4;
  if (contactSensorPresent) {
    result.contactDetected = !!contactDetected;
  }
  let energyPresent = flags & 0x8;
  if (energyPresent) {
    result.energyExpended = data.getUint16(index, /*littleEndian=*/true);
    index += 2;
  }
  let rrIntervalPresent = flags & 0x10;
  if (rrIntervalPresent) {
    let rrIntervals = [];
    for (; index + 1 < data.byteLength; index += 2) {
      rrIntervals.push(data.getUint16(index, /*littleEndian=*/true));
    }
    result.rrIntervals = rrIntervals;
  }
  return result;
}
