# vnml

## Visual Novel Markup Language.

An attempt for a pure HTML/JS Visual novels over the internet engine

Goals:

1. **Pure HTML/JS game.**

- The novel is stored directly in HTML file.

2. **Complete portability.**

- Plays in any browser, in any device, on any screen resolution.
- No additional library needed, no particular OS or browser needed.

3. **Resource sharing.**

- Backgrounds, characters, musics and sound effects are internet resources.
- Why? This is how the internet works, and should improve community built novels
- and cooperation.

4. **Easy to use.**

- No coding required. Just write VNML in a file, you can use any kind of html editor for source highlighting, build, and share.
- VNML compiler provides code checking and testing via embedded server.

5. **CSS Templates.**

- Customization via additional css files.

### What's (not) in 1.0.0.0 alpha 1 version

- Missing additional CSS templates. (You can always edit the built css with your stuff if you like. That's the good part of having a pure HTML game.)
- Missing language support
- Missing fonts change / preload

## How to install

`npm install vnmlc`

or

`yarn add vnmlc`

if you plan to write a lot of visual novels you can install it globally.

`npm install vnmlc -g`

or

`yarn add vnmlc --global`

# An example

VNML has the same syntax as HTML (please add a link here) but there is no need to know HTML, just a few tags and rules.
You can use a plain text editor but an HTML enabled one (like VS Code, or Notepad++) will provide useful code highlights and tags closure, and that's handy.
For a complete VNML documentation refer to: (please put a link here to a proper manual).

Here the simplest VNML possible file, copy the code below and put it into a file named `test.vnml` into a folder you like:

```
<vnml>
 <vnd>
  <st>THIS IS A TEST</st>
  <au>Me, the author</au>
 </vnd>
 <vn>
  <p>Hello! This is my first chapter!</p>
 </vn>
</vnml>

```

then launch `vnml c test.vnml`

If everything is ok you'll se an output like this:

```
VNML Compiler & builder v.1.0.0

Checking test.vnml

References

Labels

Total number of jumps: 0
Total number of choices: 0
Total number of chapters: 1

Title: THIS IS A TEST, Author: Me, the author
```

now you can use the build command `vnml b test.vnml`
and a build folder with a bunch of file will appear.
Copy the folder in your favourite webserver and play it.

VNML comes with an embedded web server for testing purposes.
`vnml b test.vnml -c -r`

## The Future

- A standalone version of the compiler maybe?
- Video playback?
