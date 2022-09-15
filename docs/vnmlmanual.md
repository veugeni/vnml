# The VNML Manual

#### version 1.0.1

## Foreword

VNML is _not_ the most complete, most powerful, most anything you like visual novel engine. There are many out there with richer features, and enormous flexibility. The idea behind VNML is to be used easily everywhere, to be easy and fun to write and to allow the community of novelists and artists to share their works.

I'll keep it simple, and fast, because I'm focussed on novels, for super duper awesome stunning games experiences other engines exist.

## The game

A visual novel is (mainly) a novel with graphics and sounds, where the player can make decisions during the story. The various choices he mades change the outcome of the plot. That's it.

Images and audio files must be available over the internet, hosted by
the same server or coming from different URLs (here the sharing idea, see?),
but cannot be embedded in the file. Allowed formats are the same as "standard" HTML files (jpg, png, svg for images, wav, mp3, ogg for audio files).

## The screen

VNML screen is made of three parts:

- background.
- left, middle, and right character over the background.
- text area, in the bottom part of the screen.
- choices area, in the upper part of the screen.
- speaker label, over the text area.

Screen layout is handled by the core (css) style to be visually correct on any kind of device. Even if a certain amount of customization is possible, using additional CSS file, there is no way to move stuff around, or animate
single characters, and so on. (Please read the foreword.)

## Background

Any kind of image can be used as a backgroud. The engine will adapt it to show the central part over the 70% of screen height to be nicely shown on mobile devices too. A resolution of 1280x720 is usually good.

The tag responsible for changing the background is `<bk></bk>` and can have different attributes for special effects: `"flip", "blur", "gray", "flash", "thunder"`

## Characters

A "character" is an image that can me shown over the background on the left or right side, or in the middle. Usually is the image of a person and it's used to show who's talking to the user but it can serve also for showing objects or "special effects" over the background. There isn't a way to move the characters around, or to place them in a position different from the three stated above because the engine will manage the positioning to adapt it to the various devices. (And also because if you need to move sprites around there are plenty of really powerful GAME engines to do it.)
To have characters with a transparent background you can't use JPG but PNG or SVG formats only.

To show a character on the left position use `<cl></cl>`, for the middle one use `<cm></cm>`, and for the right position use `<cr></cr>`.
When a tag is provided with a value between the opening tag and the closing tag the engine will display the character, when nothing it's in there the character in that position will be hidden.

```
 // Shows the character named 'tiger'
 <cr><tiger/></cr>

 // Shows the image on the left side
 <cl>http://www.someaddress.com/image.png</cl>

 // Hides the image on the left side
 <cl></cl>

```

**See "References and URLs" chapter for details on named characters.**

# Music and sound effects

The difference between music and a sound effect is only that the first will be played continuously, the second will stop as soon as finished. There is only one music channel and only one effect channel, this means you can have a background music and a single effect playing an any chapter change.

## Chapters

The story is a sequence of chapters, read from above to below, with the possibility to jump to different chapters. A chapter is a text block wrapped in a anonimous text tag `<p>`, or a named character tag `<tiger>`. Texts can be any length, engine will automatically split long texts into paragraphs so the coder ain't to worry about opening and closing tags if the text is too long.

```
<p>This is an anonimous chapter, no name is shown on the speaker label!</p>
<tiger>In here tiger is speaking, tiger's name will be shown.</tiger>

// There's a twist in naming... this is useful when changing
// characters during dialogs.
<cl><jon/></cl>
<cr><tiger /><cr>
<p>In here is tiger speaking! Because it's the last character shown.</p>

```

## Choices and labels

A choice is a tag with a text, an optional goto tag to jump to another chapter, and special condition attributes to show it or not based on previous choices.

A simple choice is `<ch>Choose me!</ch>` when the player chooses this one the engine will simply go to the next chapter. If a goto tag is provided like in `<ch>No, choose me! <gt>other_choice</gt></ch>` the game will go to the label named 'other_choice' and let the story proceed from there.

What's a label? It's something like `<lb>i_m_a_label</lb>` places anywhere in the code.

```
<p>Please make a choice</p>
<ch>I will go on</ch>
<ch>I'll go away!</gt>away</gt></ch>

<p>You go on!!!</p>

<lb>away</lb>
<p>You've gone far away!</p>

```

Please note that when the gamer chooses the first one he will see "You go on!!!" and then "You've gone far away!". You have to plan your stories to avoid this with proper jumps. The compiler will signal unused labels and improper jumps to help you.

To hide or show choices you can use the following tags `"HIDEIFZERO", "SHOWIFZERO", "HIDEIFNONZERO", "SHOWIFNONZERO"` providing a variable to be tested.

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

# Variables

# Comments

# The end tag
