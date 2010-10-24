#!/usr/bin/python2
import sys,asyncore,websocket,httplib,json,subprocess
HOST='localhost'
PORT=8080
BG_SETTER=['awsetbg','-a','bg']

def handleMessage(message):
    res = json.loads(message)
    conn = httplib.HTTPConnection(HOST,PORT)
    conn.request("GET",'/'+res['data'])
    image = conn.getresponse()
    bg = open('bg','w+')
    bg.write(image.read())
    bg.close()
    image.close()
    conn.close()
    sys.stdout.write('setting %s\n' % res['data'])
    subprocess.call(BG_SETTER) 

ws = websocket.WebSocket('ws://'+HOST+':'+str(PORT)+'/websocket',
        onopen=lambda: sys.stdout.write('Opened connection\n'),
        onclose=lambda: sys.stdout.write('Closed connection\n'),
        onmessage=handleMessage)
try:
    asyncore.loop()
except:
    ws.close()
