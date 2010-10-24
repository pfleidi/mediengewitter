BUGS
====
1. Running the current implementation of mediengewitter websocket server
will crash when receiving malformed websocket client packets.

For example it will crash when running the python client :
#!/usr/bin/python2
import sys,asyncore,websocket,httplib

def handleMessage(message):
    sys.stdout.write(message+'\n');

ws = websocket.WebSocket('ws://localhost:8080/websocket',
        onopen=lambda: sys.stdout.write('Opened connection\n'),
        onclose=lambda: sys.stdout.write('closed connection\n'),
        onmessage=handleMessage);
try:
    asyncore.loop()
except:
    ws.close()

the websocket lib i used was: http://github.com/mtah/python-websocket commit d1acbc8d6f6ad4c23092
