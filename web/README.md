# Screenshot

![A screenshot](screenshot.jpg)


# Building

```sh
$ make
```

This will create all the necessary files in the folder `./dist`.

Because image loading is not allowed via the `file://` URI, you will have to
serve the dist folder from some web server. Below is a Nginx configuration as
an example.

```nginx
server {
  server_name mtg-recognition.lc;
  listen 80;

  location / {
    root /home/user/path/to/dist;
    more_clear_headers 'ETag';
    more_clear_headers 'Last-Modified';
    more_set_headers 'Cache-Control: private';
  }
}
```
