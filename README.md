# vnml

## Visual Novel Markup Language. Version 1.0.3

An attempt for a pure HTML/JS Visual novels over the internet engine.

(What's a Visual Novel? Click [here](https://it.wikipedia.org/wiki/Visual_novel).)

Goals:

1. **Pure HTML/JS game.**

   - The novel is stored directly in HTML file.
   - Game saved in browser's local storage.

2. **Complete portability.**

   - Plays in any browser, in any device, on any screen resolution.
   - No additional library needed, no particular OS or browser needed.

3. **Resource sharing.**

   - Backgrounds, characters, musics and sound effects are internet resources. Why? This is how the internet works, and should improve community built novels
     and cooperation.

4. **Easy to use.**

   - No particular coding skills required. Just write VNML source in a file, (you can use any kind of html editor for source highlighting), build, and share. VNML compiler provides code checking and testing via embedded server.

5. **CSS Templates.**

   - Customization via additional css files.

### What's (not) in 1.0.3 version

- Additional CSS templates.
- Fonts change / preload.
- Opengraph / SEO settings.

## How to install

`npm install vnmlc`

or

`yarn add vnmlc`

if you plan to write a lot of visual novels you can install it globally.

`npm install vnmlc -g`

or

`yarn add vnmlc --global`

# An example

VNML has the same basic syntax of HTML but there is no need to know full HTML, just a few tags and rules. If you're curious about what HTML is take a look [here](https://www.codecademy.com/learn/learn-html).

VNML can be written with a plain text editor but an HTML enabled one (like VS Code, or Notepad++) will provide useful code highlights and tags closure that are handy.

For a complete VNML documentation refer to the [VNML Manual](docs/vnmlmanual.md).

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
VNML Compiler & builder v.1.0.3

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
Copy the folder in your favourite webserver and play it with a browser.

VNML comes with an embedded web server for testing purposes.
`vnml b test.vnml -c -r`
your default browser should open with the menu screen.

## What's in the Future?

- A standalone version of the compiler, maybe?
- Video playback?
