# The VNML Manual

#### version 1.0.3

## Foreword

VNML is _NOT_ the most complete, most powerful, most anything visual novel engine. There are many out there with richer features, and enormous flexibility. The idea behind VNML is to be used everywhere and to be easy and fun to write allowing the community of novelists and artists to share their works.

I believe good visual novels should be focussed on storytelling, for super duper awesome stunning games experiences other engines exist.

Get over it ;)

## The game

A visual novel is (mainly) a story with graphics and sounds, where the player can take decisions. The various choices change the outcome of the plot. That's it.

Images and audio files must be available over the internet and can't be embedded in the file. Allowed formats are `jpg, png, svg` for images and `wav, mp3, ogg` for audio files.

The game can be played writing browsing the proper url in any modern browser, even a smart tv set if you like or a mobile device.

Given a vnml file named `this_is_a_game.vnml` placed in `www.myhost.com` the resulting address will be `www.myhost.com/this_is_a_game.html`

Playing is easy:

- From the main menu choose a slot where the game will be saved. If there's a saved game you can continue from there or restart.
- Read the chapter.
- Click or tap on the chevron on the bottom right corner of the screen to go to the next chapter.
- When a decision must be taken a choices window will appear.

There are also three icons in the bottom part of the text screen:

- Audio on / off. Will disable and enable music and sound effects.
- Go fullscreen. Will put the game fullscreen. The same icon will put it back in window mode.
- Exit. Well... you got it.

The game saves automatically on chapter change in the save slot choosed in the initial menu so there's no need to worry to lose progress.

VNML has natively multilanguage support, and may take advantage of automatic translations as per standard HTML pages.

## VNML syntax

VNML is based on HTML and share it's syntax and logic, log story short: it's a list of nested tags with some text in them.

### What's HTML?

It's the language behind all the internet and it's a big subject so, if you want more, click [here](https://www.codecademy.com/learn/learn-html).

### What's a tag?

A tag is a "command" we give to the VNML engine to do something. It's a short text enclosed in angular brackets `<je_suis_a_tag>`, can contain text and other tags, and MUST be closed by the same name with prefixed by a slash `</je_suis_a_tag>`. A tag can have special words after it's name called `attributes` which will modify tag behaviour.

```
 <im_a_tag attribute_1 attribute_2>
  tag_content
 </im_a_tag>
```

Given than, some rules must be obeied to have a proper VNML file:

- ALL VNML code must be enclosed in `<vnml></vnml>`, everything outside it will be ignored by the engine (BUT NOT BY THE BROWSER!).
- All tags must be closed in the proper order:

```
  <!-- THIS IS OK -->
  <first_tag>
    <second_tag>
      SOMETHING
    </second_tag>
  </first_tag>

  <!-- THIS IS NOT -->
  <first_tag>
    <second_tag>
      SOMETHING
    </first_tag>
  </second_tag>

  <!-- THIS IS DEFINETLY NOT -->
  <first_tag>
    <second_tag>
      SOMETHING
  </first_tag>


```

- Labels, named resources and characters, variables shouldn't have spaces in them, better use underscores.
- Labels, named resources and characters, variables MUST NOT be named as VNML reserved tag names: `vnml, vnd, vn, st, au, ln, bk, bkm, cl,
cm, cr, bgm, sfx, ch, gt, lb, jmp, hideifzero, showifzero, hideifnotzero, showifnotzero, inc, dec, clr, wait, menu, end`

Here an example of a working VNML file:

```
<vnml>
  <vnd>
    <st>Mister Tiger's amazing adventure</st>
    <au>John Smith</au>

    <menu>
      <bk>menu_background.jpg</bk>
      <bkm>menumobile_background.jpg</bkm>
    </menu>

    <ln>en</ln>

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
    <bk wobble>theplace</bk>
    <cm>tiger</cm>
    <tiger>Hello it'sa me! Mister Tiger!</tiger>
  </vn>
</vnml>
```

## The main menu

Enough for gameplay and syntax, let's dig in VNML details and logic.

The first screen you'll see is VNML main menu. It's made of:

- a background image,
- a title,
- author name
- three save slots.

Slots' texts are managed atomatically by the game engine based on the story language, background image, title and author name come from what's in the `<vnd></vnd>` tag.

```
  <vnml>
    <vnd>
      <st>Story Title</st>
      <au>Author name</st>
      <ln>en</ln>
      <menu>
        <bk>main_background.jpg</bk>
        <bkm>optional_mobile_background.jpg</bkm>
      </menu>
    </vnd>
  </vnml>
```

In the example above we set the story title and author name, the language code to english `"en"` (which is also the default language). Please refer to [ISO639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for a complete list.

In the `<menu></menu>` tag we specify the main background image `<bk></bk>` and an optional mobile background image `<bkm></bkm>`. If the latter is not present VNML will use the first adapting it to the screen size.

## The screen

VNML screen is made of five parts:

- background.
- left, middle, and right character over the background.
- text area, in the bottom part of the screen.
- choices area, in the upper part of the screen.
- speaker label, over the text area.

Screen layout is handled by the core (css) style to be visually correct on any kind of device. There is no way to move stuff around, or animate
single characters, and so on, but there are various "special effects" to spice things up. (Please read the foreword, in the future more css customization and features will be added, or not... ^\_^)

## Background

Any kind of image in `.jpg`, `.png` or `.svg` format can be used as a background. The engine will adapt it to show the central part over the 70% of screen height to be nicely shown on mobile devices too but a resolution of 1280x720 is preferred.

The tag responsible of setting the background is `<bk></bk>` and can have different attributes for special effects: `"flip", "blur", "gray", "flash", "thunder", "immediate", "shake", "quake", "transparent", "translucent", "wobble"`

```
 // Shows the background named house_in_the_forest
 <bk>house_in_the_forest</bk>

 // Shows the image named thepub.jpg
 <bk>thepub.jpg</bk>

 // Shows house_in_the_forest with a blurring effect
 <bk blur>house_in_the_forest</bk>
```

## Characters

A "character" is an image shown over the background on the left side, right side, or in the middle. Usually is the image of a person and it's used to show who's talking to the player but it can serve also for showing objects or "special effects" over the background. There isn't a way to move characters around, or to place them in a position different from the three stated above because the engine will manage the positioning to adapt it to the various devices. (And also because if you need to move sprites around there are plenty of really powerful GAME engines to do it. Believe me, you're in the wrong place.)
To have characters with a transparent background you must use PNG or SVG formats only.

To show a character on the left position use `<cl></cl>`, for the middle one use `<cm></cm>`, and for the right position use `<cr></cr>`.
When a tag is provided with a value between the opening tag and the closing tag the engine will display the character, when nothing it's in there the character in that position (if any) will be hidden.

```
 // Shows the character named 'tiger'
 <cr>tiger</cr>

 // Shows the image from www on the left side
 <cl>https://www.someaddress.com/image.png</cl>

 // Shows the image from the res/ folder on the left side
 <cl>image.png</cl>

 // Shows the image from the xyz/somefolder/ folder on the left side
 <cl>xyz/somefolder/image.png</cl>

 // Hides the image on the left side
 <cl></cl>

```

**See "References and URLs" chapter for details on named characters and addresses.**

# Music and sound effects

The difference between music and a sound effect is that the first will be played continuously, the second will stop as soon as finished. There is only one music channel and only one effect channel, this means you can have a background music and a single effect playing on any chapter change.

## Chapters

A story is a sequence of chapters with optional jump capability to different chapters. A chapter is a text block wrapped in an anonimous text tag `<p></p>`, or a named character tag like `<tiger></tiger>`. Texts can be any length, the engine will automatically split long texts into paragraphs so the coder ain't to worry about opening and closing tags if the text is too long.

```
<p>This is an anonimous chapter, no name is shown on the speaker label!</p>
<tiger>In here tiger is speaking, tiger's name will be shown.</tiger>

```

**See "References and URLs" chapter for details on named characters and addresses.**

## Choices and labels

A choice is a tag with a text, an optional goto `gt` tag to jump to another chapter, and special condition tags to show it or not based on previous choices. If no goto tag is provided the engine will simply proceed to the next chapter.

A choice is `<ch>Choose me!</ch>` when the player chooses this one the engine will go to the next chapter. If a goto tag is provided like in `<ch>No, choose me! <gt>other_choice</gt></ch>` the game will go to the label named 'other_choice' and let the story proceed from there.

What's a label? It's a tag setting a specific location in the story giving it a name usable in `<gt></gt>` and `<jmp></jmp>` tags. A label can be any text but, as all good coders know, avoid spaces and weird characters in it just to be sure.

```
<p>Please make a choice</p>
<ch>I will go on</ch>
<ch>I'll go away!</gt>away</gt></ch>

<p>You go on!!!</p>
<end></end>

<lb>away</lb>
<p>You've gone far away!</p>
<end></end>

```

Why are there those `<end></end>` tags?

VNML will read chapters from top to bottom, but a story with jumps (or branches) needs to know where to stop to avoid showing that shouldn't be reached. If removing the first `<end></end>` what will happen if the user chooses the first option? VNML will show "You go on!!!" and then will show "You've gone far away!" and that is NOT what we want.

The compiler will signal unused labels and improper jumps to help you.

As stated above another twist regarding choices is we can hide or show some of them according to previuous decisions. To hide or show choices `<hideifzero>, <showifzero>, <hideifnonzero>, <showifnonzero>` tags can be used.

```
<beggar>Please give me a candy...</beggar>

// this choice is always visible
<ch>I won't give you a thing!</ch>

// this choice is hidden if 'candy' is not zero
<ch>Sorry I have no candies. <hideifnonzero>candy</hideifnonzero><ch>

// This choice is visible if 'candy' is not zero
<ch>I'll give you a candy <showifnonzero>candy</showifnonzero></ch>

```

**Important:** remember to always let at least one choice to be selectable or the player will be stucked on that chapter forever.

**See "Variables" chapter for more details on conditional choices**

# References and URLs

Named characters and backgrounds are stored in a special tag named `<vnd></vnd>`. When using a named character in chapters the `<nm></nm>` tag will say to the engine which name to show, and `<bk></bk>` will tell where the visual is stored. The optional `<bkm></bkm>` can be used to specify an image to be used on mobile devices only.

```
 <vnml>
    <vnd>
        <st>Mister Tiger's amazing adventure</st>
        <au>John Smith</au>
        <menu>background.jpg</menu>
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
            <bk>the_place_background.jpg</bk>
            <bkm>the_place_background_mobile.jpg</bkm>
        </theplace>
    </vnd>
    <vn>
       <bk>theplace</bk>
       <cm>tiger</cm>
       <tiger>Hello it'sa me! Mister Tiger!</tiger>
    </vn>
 </vnml>
```

Here how resources are handled:

- All resource names ending with: `.jpg,.jpeg,.png,.svg` are files, not named resources.
- if no path is specified it'll assume they are placed in the default `/res` folder in the same location of the story. I.e. `jon.jpg` equals to `/res/jon.jpg`.
- If a relative path is provided, i.e. `/assets/menu/somefile.jpg` it will use the address on the same server.
- If a fully fledged url is provided, i.e. `https://www.myresources.it/myfile.png` it will fetch the image from there.
- If nothing of the above applies the resource is a named resource and the engine will look up for it in the `<vnd></vnd>` tag content.

The same rules apply for audio resources, allowed extensions are `.ogg, .mp3, .wav`, but there is no way (so far) to have a named audio resource.

The optional special tag `<bkm></bkm>` works exactly as `<bk></bk>` and must be added to the same named resource to specify the correct image to use. It can't be used in the story though, only `<bk></bk>` is allowed there.

```
  <vnd>
    <!-- A classic use of <bkm> -->
    <menu>
       <bk>desktop_menu_background.jpg</bk>
       <bkm>mobile_menu_background.jpg</bkm>
    </menu>

    <!-- Can be used for backgrounds -->
    <thepub>
       <bk>desktop_pub.jpg</bk>
       <bkm>mobile_pub.jpg</bkm>
    </thepub>

    <!-- Or in characters -->
    <theguy>
       <nm>Mr Responsive</nm>
       <bk>desktop_guy.png</bk>
       <bkm>mobile_guy.jpg</bkm>
    </theguy>

  </vnd>
```

**NB:** VNML compiler will warn you of mismatches in named resources and so on but can't know if a resource is present over a remote server and will not check if it's present in the res folder.

# Variables

Visual novels must keep track of some of player's choices to let him reach some parts of the story. Tipically a VN has various endings, and secrets maybe, that can be unlocked making a specific series of decisions. For example choosing not to eat in a certain part of the story may allow the player to go in a diner in a later part and unlock the diner thread which will lead to a marvelous ending. But writing it could be very hard, if not impossible, with no way to know if the player choosed to eat or not.

VNML has variables handling tags `<inc></inc>, <dec></dec>, <clr></clr>` to keep track of what the player do. They can be placed anywhere between chapter tags and will tell the engine to alter the value of the variable (imagine it as a named box with a number inside) respectively adding one, subtracting one, or setting it to zero.

A variable values is used in choices where one or more of `<hideifzero>, <hideifnonzero>, <showifzero>, <showifnonzero>` tags are provided. When the condition is is met the choice will be shown or hidden accordingly.

A variable name can be any string of text, as a professional advice avoid short stupid names like `a1`, or spaces and weird characters but use a meaningful name: `can_eat_at_diner`.
All variables start as zero, any value greater than zero is considered non zero, any value below zero is considered zero.

**Why have do we can increment and decrement when the only check made is if zero or not? Because it's ready for future development if needed. Assume that `"inc"` and `"showifnonzero"` are good enough for almost all cases**

```
    <!-- ... blah blah ... -->

    <!-- When the engine read this line can_eat_at_diner will be 1 -->
    <inc>can_eat_at_diner</inc>
    <p>You decide to go after the villain and skip the lunch!</p>

    <!-- ... the plot goes on ... -->
    <p>You stop your car in a park lot</p>

    <!-- These two will be always available -->
    <ch>Sleep in the car <gt>sleep_in_car</gt></ch>
    <ch>Phone to your soulmate <gt>phone_to_bill</gt></ch>

    <!-- And here's the magic. -->
    <ch>Look, a diner! <showifnonzero>can_eat_at_diner</showifnonzero> <gt>the_diner</gt></ch>

```

# Comments

No, I'm not talking of you yelling how much you like this idea. (Even if it would be appreciated). Comments are special tags that can be placed around to keep track of anything you may need. The syntax is the same as in HTML and can contain any kind of text, and also other tags, because they'll be completely ignored by the engine.

```
    <!-- THIS IS A COMMENT -->

    <!-- THIS IS A COMMENT TOO
    SPLITTED
    ON
    DIFFERENT
    LINES
    -->

    <!-- THIS IS A COMMENT
      CONTAINING OTHER TAGS

      <bk>i_will_never_be_seen.jpg</bk>
    -->

    <!-- THIS IS A COMMON MISTAKE and will fool the compiler
         because the end tag is missing a dash :) ->
```

# The end and jump tags

The end tag `<end></end>` and jump tag `<jmp></jmp>` are precious allies and deserve a proper explanation. When the engine reaches an end tag it will stop, pretty simple. All the ending, credits, and final greetings are normal chapters in vnml logic so, if no end tag is properly placed the engine will show them and then proceed.

The jump tag will move the game to the label specified, the jump will happen as soon as the user interacts with the paragraph, the user will have te illusion of a continuous story.

What's the need for jumping around?
Everytime there's a choice in the novel a sort of "new timeline" is make in the game, like a branch on a tree. With no jumping capability every branch must lead to an ending, this means that any choice will lead to a complete different "future" even if it's the same as other branches.
Using jump you can force the story to take a specific path and "reuse" other brances.

```

<vnml>
  <vnd>
    <st>Mister Tiger's amazing adventure</st>
    <au>John Smith</au>
    <menu>background.jpg</menu>

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
    <jmp>a_tricky_label</jmp>

    <!-- the game will skip this part -->
    <tiger>Sadly this text will never be shown!</tiger>

    <lb>a_tricky_label</lb>
    <tiger>Please choose my destiny.</tiger>

    <ch>Should I go to the bad ending?</ch>
    <ch>Should I go to the good ending? <gt>good_ending</gt></ch>
    <bk>thebadscreen.jpg</bk>
    <sfx>theuglysound.ogg</sfx>
    <p>OH no! This is a bad ending!!! So bad! So bad!!!</p>

    <!-- Try to remove this and see what happens -->
    <end></end>

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

Another special tag is `<wait></wait>`. It tells the engine to wait for a certain amount of seconds or to wait for a key before proceeding. When the engine encounters it, it will hide the text window showing the visuals full screen. When the player presses a key or when the required time is passed the engine will go to the next chapter.

What's the need for wait tag?

- Intros / cutscenes / endings / credits,
- Enphatize some moments or transitions in the story,
- Show the user a map or the like.

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

# Languages and translations

Taking advantage of modern browsers VNML supports all unicode caracters and languages, it means you can write chapters directly in your mother tongue. Specify the `<ln></ln>` tag is not mandatory but it will enable automatic translations if user's browser has that feature. **Quality and realiability of automatic translations may vary, I'm not responsible for them, but they are free.**

# The story bundle (how to compile and distribute)

To be played the vnml file must be built into a story bundle, a fancy name
for a folder with some stuff inside, and must be uploaded into a web server for the world to play. Testing the file is similar but vnml provides a local server allowing you to try it immediately. The vnml command line interface (vnml) is used both compiling and building.

try `vnml check ./docs/buildme.vnml`

you'll see something like:

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
