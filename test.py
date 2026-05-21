import urllib.request
import urllib.error
try:
    urllib.request.urlopen('http://127.0.0.1:8000/api/admin/workspaces')
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
