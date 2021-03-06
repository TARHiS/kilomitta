#!/usr/bin/env python
# vi: et sw=2 fileencoding=utf8

import SimpleHTTPServer


class MyHTTPRequestHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header("Access-Control-Allow-Origin", "*")
    SimpleHTTPServer.SimpleHTTPRequestHandler.end_headers(self)


if __name__ == '__main__':
  SimpleHTTPServer.test(HandlerClass=MyHTTPRequestHandler)
