# The VNML Manual

#### version 1.0.1

## Foreword

VNML is _NOT_ the most complete, most powerful, most anything you like visual novel engine. There are many out there with richer features, and enormous flexibility. The idea behind VNML is to be used easily everywhere, to be easy and fun to write and to allow the community of novelists and artists to share their works.

I'll keep it simple, and fast, because I'm focussed on novels, for super duper awesome stunning games experiences other engines exist.

## The game

A visual novel is (mainly) a novel with graphics and sounds, where the player can take decisions during the story. The various choices he mades change the outcome of the plot. That's it.

Images and audio files must be available over the internet, hosted by
the same server or coming from different URLs (here the sharing idea, see?),
but cannot be embedded in the file. Allowed formats are the same as "standard" HTML files (jpg, png, svg for images, wav, mp3, ogg for audio files).

The game can be played writing the proper url in any modern browser, even a smart tv set if you like. The url is made by the url of the web server you've put the game in and the name of the file plus `.html`

Given a vnml file named `this_is_a_game.vnml` placed in `www.myhost.com` the resulting address will be `www.myhost.com/this_is_a_game.html`

The game saves automatically on chapter change in the save slot choosed in the initial menu.

## The screen

VNML screen is made of five parts:

- background.
- left, middle, and right character over the background.
- text area, in the bottom part of the screen.
- choices area, in the upper part of the screen.
- speaker label, over the text area.

Screen layout is handled by the core (css) style to be visually correct on any kind of device. Even if a certain amount of customization is possible, using additional CSS file, there is no way to move stuff around, or animate
single characters, and so on. (Please read the foreword.)

## Background

Any kind of image can be used as a backgroud. The engine will adapt it to show the central part over the 70% of screen height to be nicely shown on mobile devices too. A resolution of 1280x720 is usually good.

The tag responsible for changing the background is `<bk></bk>` and can have different attributes for special effects: `"flip", "blur", "gray", "flash", "thunder", "immediate"`

```
 // Shows the background named house_in_the_forest
 <bk>house_in_the_forest</bk>

 // Shows the image named thepub.jpg
 <bk>thepub.jpg</bk>

 // Shows house_in_the_forest with a blurring effect
 <bk blur>house_in_the_forest</bk>
```

## Characters

A "character" is an image shown over the background on the left side, right side, or in the middle. Usually is the image of a person and it's used to show who's talking to the player but it can serve also for showing objects or "special effects" over the background. There isn't a way to move the characters around, or to place them in a position different from the three stated above because the engine will manage the positioning to adapt it to the various devices. (And also because if you need to move sprites around there are plenty of really powerful GAME engines to do it. Believe me, you're in the wrong place.)
To have characters with a transparent background you must use PNG or SVG formats only.

To show a character on the left position use `<cl></cl>`, for the middle one use `<cm></cm>`, and for the right position use `<cr></cr>`.
When a tag is provided with a value between the opening tag and the closing tag the engine will display the character, when nothing it's in there the character in that position (if any) will be hidden.

```
 // Shows the character named 'tiger'
 <cr>tiger</cr>

 // Shows the image from www on the left side
 <cl>http://www.someaddress.com/image.png</cl>

 // Shows the image from the res/ folder on the left side
 <cl>image.png</cl>

 // Shows the image from the xyz/somefolder/ folder on the left side
 <cl>xyz/somefolder/image.png</cl>

 // Hides the image on the left side
 <cl></cl>

```

**See "References and URLs" chapter for details on named characters and addresses.**

# Music and sound effects

The difference between music and a sound effect is only that the first will be played continuously, the second will stop as soon as finished. There is only one music channel and only one effect channel, this means you can have a background music and a single effect playing on any chapter change.

## Chapters

The story is a sequence of chapters, read from above to below, with optional jump capability to different chapters. A chapter is a text block wrapped in an anonimous text tag `<p></p>`, or a named character tag `<tiger></tiger>`. Texts can be any length, the engine will automatically split long texts into paragraphs so the coder ain't to worry about opening and closing tags if the text is too long.

```
<p>This is an anonimous chapter, no name is shown on the speaker label!</p>
<tiger>In here tiger is speaking, tiger's name will be shown.</tiger>

// There's a twist in naming... this is useful when changing
// characters during dialogs.
<cl>jon</cl>
<cr>tiger<cr>
<p>In here is tiger speaking! Because it's the last character shown.</p>
<jon>Now it's Jon replying!</jon>

```

**See "References and URLs" chapter for details on named characters and addresses.**

## Choices and labels

A choice is a tag with a text, an optional goto `gt` tag to jump to another chapter, and special condition attributes to show it or not based on previous choices. If no goto tag is provided the engine will simply proceed to the next chapter.

A choice is `<ch>Choose me!</ch>` when the player chooses this one the engine will go to the next chapter. If a goto tag is provided like in `<ch>No, choose me! <gt>other_choice</gt></ch>` the game will go to the label named 'other_choice' and let the story proceed from there.

What's a label? It's something like `<lb>i_m_a_label</lb>` places anywhere in the code. A label can be any text but, as all good coders know, avoid spaces and weird characters in it just to be sure.

```
<p>Please make a choice</p>
<ch>I will go on</ch>
<ch>I'll go away!</gt>away</gt></ch>

<p>You go on!!!</p>

<lb>away</lb>
<p>You've gone far away!</p>

```

Please note that when the player chooses the first one he will see "You go on!!!" and then "You've gone far away!". You have to plan your stories to avoid this with proper stops with the `<end></end>` tag. The compiler will signal unused labels and improper jumps to help you.

To hide or show choices you can use the following tags `<hideifzero>, <showifzero>, <hideifnonzero>, <showifnonzero>` providing a variable to be tested.

```
<beggar>Please give me a candy...</beggar>

// this choice is always visible
<ch>I won't give you a thing!</ch>

// this choice is hidden if 'candy' is not zero
<ch>Sorry I have no candies. <hideifnonzero>candy</hideifnonzero><ch>

// This choice is visible if 'candy' is not zero
<ch>I'll give you a candy <showifnonzero>candy</showifnonzero></ch>

```

**See "Variables" chapter for more details on conditional choices**

# References and URLs

Even if is not mandatory it's very useful to have named characters (or backgrounds) because if you plan to change a visual you can do it without changing it in all occurences. Named characters, images, and story info are stored in a special tag named `<vnd></vnd>`. When using a named character in chapters the `<nm></nm>` tag will say to the engine which name to show, and `<bk></bk>` will tell where the visual is stored.
There are also other special tags available: `<st></st>` provides the story title, `<au></au>` for author's name, `<menu></menu>` for the initial menu visual and `<ln></ln>` for the story language. The language codes used are standard html ISO codes in the form `en-US` where the first code is the language code and the second is the country code. (`https://www.w3schools.com/tags/ref_language_codes.asp`, `https://www.w3schools.com/tags/ref_country_codes.asp`)

```
 // An Example
 <vnml>
    <vnd>
        <st>Mister Tiger's amazing adventure</st>
        <au>John Smith</au>
        <menu>assets/menu/background.jpg</menu>
        <ln>en-EN</ln>

        <!-- This is a named character -->
        <tiger>
            <!-- this is the name shown over the chapter -->
            <nm>Mister Tiger</nm>
            <!-- This is how Mr Tiger looks like -->
            <bk>mister_tiger.png</bk>
        </tiger>

        <!-- This is a background resource -->
        <theplace>
            <bk>theplacebackground.jpg</bk>
        </theplace>
    </vnd>
    <vn>
       <bk>theplace</bk>
       <cm>tiger</cm>
       <tiger>Hello it'sa me! Mister Tiger!</tiger>
    </vn>
 </vnml>
```

The engine will assume that all resources that end with: `.jpg,.jpeg,.png,.svg,.gif` are visual sources, if no path is specified, (no slashes `/` around) they are placed in the default `/res` folder of the same server, the same location, the story bundle is placed.
If a path is provided, like `/assets/menu/somefile.jpg` it will use the address on the same server. If a fully fledged url is provided, `https://www.myresources.it/myfile.png` it will fetch the image from there.
The same applies for audio resources but with `.ogg, .mp3, .wav` suffixes.

Any other string will be considered a named resource and looked in the `<vnd>` tag.

NB: vnml compiler will signal mismatches in named resources and so on but can't know if a resource is present over a remote server.

# Variables

A very basic feature of visual novels is to keep track of some of the player choices to enable special parts of the story. Tipically a VN has various endings, and secrets, that can be unlocked making a specific series of decisions. For example choosing not to eat in a certain part of the story may allow the player to go in a diner in a later part and unlock the diner thread which will lead to a marvelous ending. But coding such a situation, could be very hard with no way to know if the player choosed to eat or not because the story will split into an enormous amount of branches.
That's why VNML allows the use of special tags `<inc></inc>, <dec></dec>, <clr></clr>` they can be placed in any place and tell the engine to alter the value of the variable (imagine it as a named box with number inside) respectively adding one, subtracting one, or setting it to zero.

When in a choice one or more of `<hideifzero>, <hideifnonzero>, <showifzero>, <showifnonzero>` tags are provided it will be hidden or shown if the condition is met, allowing the player to go in a different direction.

A variable name can be any string of text, as a professional advice avoid short stupid names like `a1`, or spaces and weird characters but use a meaningful name: `can_eat_at_diner`.
All variables start as zero, any value greater than zero is considered non zero, any value below zero is considered zero.

**Why have do we can increment and decrement when the only check made is if zero or not? Because it's ready for future conditions if needed. If not assume that <inc> and <showifnonzero> are good enough**

```
    <!-- ... blah blah ... -->
    <inc>can_eat_at_diner</inc>
    <p>You decide to go after the villain and skip the lunch!</p>

    <!-- ... and time goes on ... -->
    <p>You stop your car in a park lot</p>
    <ch>Sleep in the car <gt>sleep_in_car</gt></ch>
    <ch>Phone to your soulmate <gt>phone_to_bill</gt></ch>

    <!-- And here's the magic  -->
    <ch>Look, a diner! <showifnonzero>can_eat_at_diner</showifnonzero> <gt>the_diner</gt></ch>

```

# Comments

No, I'm not talking of you telling me how much you like this idea. (Even if it would be apreciated). Comments are special tags that can be placed around to keep track of anything you may need. The syntax is the same as in HTML and can contain any amount of text because they'll be completely ignored by the engine.

```
    <!-- THIS IS A COMMENT -->

    <!-- THIS IS A COMMENT TOO
    SPLITTED
    ON
    DIFFERENT
    LINES
    -->

    <!-- THIS IS A COMMON MISTAKE and will fool the compiler
         because the end tag is missing a dash :) ->
```

# The end tag

The end tag `<end></end>` is a precious ally and deserves a proper paragraph and explanation. When the engine reaches an end tag it will stop, pretty simple. All the ending, credits, and final greetings are normal chapters and if no end tag is properly placed the engine will show them and then proceed.
Another user of the end tag is to tell the engine if there's a variable containing the score of the game.

```

<vnml>
  <vnd>
    <st>Mister Tiger's amazing adventure</st>
    <au>John Smith</au>
    <menu>assets/menu/background.jpg</menu>

    <!-- This is a named character -->
    <tiger>
      <!-- this is the name shown over the chapter -->
      <nm>Mister Tiger</nm>
      <!-- This is how Mr Tiger looks like -->
      <bk>mister_tiger.png</bk>
    </tiger>

    <!-- This is a background resource -->
    <theplace>
      <bk>theplacebackground.jpg</bk>
    </theplace>
  </vnd>
  <vn>
    <bk>theplace</bk>
    <cm>tiger</cm>
    <tiger>Hello it'sa me! Mister Tiger!</tiger>
    <ch>Should I go to the bad ending</ch>
    <ch>Or should I go to the good ending? <gt>good_ending</gt></ch>
    <bk>thebadscreen.jpg</bk>
    <sfx>theuglysound.ogg</sfx>
    <p>OH no! This is a bad ending!!! So bad! So bad!!!</p>

    <!-- Try to remove this ^_^ -->
    <end>score</end>

    <lb>good_ending</lb>
    <inc>score</inc>
    <bk>thegoodscreen.jpg</bk>
    <sfx>thevictorysound.ogg</sfx>
    <p>YAY! Victory!</p>

    <end>score</end>
  </vn>
</vnml>

```

# The wait tag

Another special tag is `<wait></wait>`. It tells the engine to wait for a certain amount of time or to wait for a key. It's used mainly in introductions to set the pace of transitions or to let the player look at an image.

```
    <!-- This will show a picture and wait for a key, or mouse button,
         or tapping. It will hide the paragraph window -->
    <bk>i_want_you_to_look_at_this.jpg</bk>
    <wait>key</wait>

    <!-- This will show a picture grayed, then waits for 3 seconds,
        and then it will show the colored picture with a fancy effect -->
    <bk gray>the_colored_picture.jpg</bk>
    <wait>3</wait>
    <bk>the_colored_picture.jpg</bk>
```

# The initial menu

The initial menu is a page where the player can choose the save slot. If the slot contains data the game will continue from the saved point, if not it'll start from the beginning.

The `<menu>` tag can be used to specify a background image for the menu, otherwise it will be black. Yes, black, with title and author as specified by `<st>` and `<au>` tags.

**Future releases will allow more customization, honest.**

# The story bundle (how to compile and distribute)

To be played the vnml file must be built into a story bundle, a fancy name
for a folder with some stuff inside, and must be uploaded into a web server for the world to see. Testing the file is similar but vnml provides a local server allowing you to try it immediately. The vnml command line interface (vnml) is used both to compile and build.

try `vnml check ./docs/buildme.vnml`

you should see something like:

```
VNML Compiler & builder v.1.0.3

Checking ./docs/buildme.vnml

References
- menu
- tiger
- theplace

Labels

Total number of jumps: 0
Total number of choices: 0
Total number of chapters: 1

Title: Mister Tiger's amazing adventure, Author: John Smith

```

this is the syntax check command. No bundle is produced but vnml will check if everything is ok with your file.

try `vnml build ./docs/buildme.vnml`

this should be the outcome:

```

VNML Compiler & builder v.1.0.3

Building ./docs/buildme

Reading source...
Checking source...
References
- menu
- tiger
- theplace

Labels

Total number of jumps: 0
Total number of choices: 0
Total number of chapters: 1

Title: Mister Tiger's amazing adventure, Author: John Smith



Building package...
Distribution package built in ./build

```

if no destination is specified with the `-d` option vnml will build into the `./build` folder. In there you'll see:

- a `buildme.html` file. This is the starting point of your game.
- a `randomname.css`, `randomname.js` and `randomname.html` files. The random name is needed to avoid browsers to cache stuff and mess around with your story.

If you plan to have your own visuals and sounds hosted on the same server place one or more folders under the build folder and remember to address your assets properly in the vnml file. The default assets folder is `/res`.

**Every time you build a story a new randomname is generated and added to the build folder. A good practice is to add the `-c` option to the build command to let it clean up the folder. It will delete story files only, no resource will be removed. `vnml build ./docs/buildme.vnml -c`**

To test your bundle add a `-r` option to the command line `vnml build ./docs/buildme.vnml -c -r` the local server will start and will open the default browser to let you play. To stop the local server press CTRL-C.

You can access vnml help typing `vnml help check` or `vnml help build`.

# How to debug your story

# Customization
