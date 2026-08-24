#!/usr/bin/env python3
"""HTTP server that appends ;charset=utf-8 to text/html and text/css Content-Type.
Usage: python3 server.py PORT DIRECTORY
Compatible with Python 3.14 where guess_type may return a single string.
"""
import http.server
import socketserver
import mimetypes
import sys
import os

PORT = int(sys.argv[1])
DIR = sys.argv[2] if len(sys.argv) > 2 else '.'

os.chdir(DIR)


class CharsetHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        r = mimetypes.guess_type(path)
        # Python 3.14+ may also return just a string or bytes; robust handling:
        if isinstance(r, tuple):
            t = r[0]
        else:
            t = r
        if t in ('text/html', 'text/css', 'text/javascript',
                'application/javascript', 'application/json',
                'text/plain', 'text/xml', 'application/xml'):
            t = t + '; charset=utf-8'
        return t

    def log_message(self, fmt, *args):
        pass


class ReusableThreadingTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


with ReusableThreadingTCPServer(("0.0.0.0", PORT), CharsetHandler) as httpd:
    print(f"Serving {os.getcwd()} on http://0.0.0.0:{PORT} (charset=utf-8 enabled)")
    httpd.serve_forever()
