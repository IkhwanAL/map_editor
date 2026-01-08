# MAP EDITOR + Procedural Generator

I just came up this idea because it's fun and challenge my current skill (2025-12-10)

## Approach

Since This is New Project My Approach is simple, i just want to make it work and if it worth to continue that i will push this Project

## List
- A Simple Map
- A Simple Algorithm For Procedural Generator
- A Simple Way To Communicate Between Server and Client
- A Simple Feature To Brush Or Play With Canvas
- An Undo / Redo Cmd

## Current Work

Right now, I'm adding an Undo Command. I did manage to undo the map source of truth, but the cache for view result are need to invalidate. So i need to think a way to invalidate the cache and rebuild it again. The Question how do i rebuild it again, should i search and destroy and create new technique or search every value and replace it with new value. I Have two approach right now.

## Thing To Refactor

- The Draw Function
- The Calculation To Detect World Coordinate, Chunk Coordinate, Local Chunk Coordinate
- A Function To Recreate new Cache
