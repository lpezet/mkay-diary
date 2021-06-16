declare module "update-section" {
  /**
   * Updates the content with the given section.
   *
   * If previous section is found it is replaced.
   * Otherwise the section is appended to the end of the content.
   *
   * @name updateSection
   * @function
   * @param {String} content that may or may not include a previously added section
   * @param {String} section the section to update
   * @param {Function} matchesStart when called with a line needs to return true iff it is the section start line
   * @param {Function} matchesEnd when called with a line needs to return true iff it is the section end line
   * @param {boolean} top forces the section to be added at the top of the content if a replacement couldn't be made
   * @return {String} content with updated section
   */
  export default function updateSection(
    content: string,
    section: string,
    matchesStart: (line: string) => boolean,
    matchesEnd: (line: string) => boolean,
    top: boolean
  ): string;

  /**
   * Finds the start and end lines that match the given criteria.
   * Used by update-section itself.
   *
   * Use it if you need to get information about where the matching content is located.
   *
   * @name updateSection::parse
   * @function
   * @param {Array.<string>} lines the lines in which to look for matches
   * @param {Function} matchesStart when called with a line needs to return true iff it is the section start line
   * @param {Function} matchesEnd when called with a line needs to return true iff it is the section end line
   * @return {object} with the following properties: hasStart, hasEnd, startIdx, endIdx
   */
  export function parse(
    lines: string[],
    matchesStart: (line: string) => boolean,
    matchesEnd: (line: string) => boolean
  );
}
