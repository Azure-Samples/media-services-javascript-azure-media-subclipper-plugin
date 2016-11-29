/// <reference path='../Modules/Common.ts' />

"use strict";

module AMVE {
    /**
     * Used for managing tooltips
     */
    export class Tooltips {
        public static Trim: string = "Trimming creates a Virtual subclip with a set in point, but no set out point. The result is a filtered manifest which plays back a live stream (given the original stream is still live), where the DVR window starts at the earliest at the set in point.";
        public static Virtual: string = "A Virtual subclip is a filtered manifest (not a separate asset) which plays back as a non-live clip of the selected video. Clipping is only GOP accurate in this mode, and the subclip disappears if it falls off the archive window of the parent asset."
        public static Rendered: string = "A rendered subclip generates a new MP4 video asset of the selected video section. Clipping is frame accurate in this mode."
        public static ZoomIn: string = "Zoom Scrubber In";
        public static ZoomOut: string = "Zoom Scrubber Out";
    }
} 