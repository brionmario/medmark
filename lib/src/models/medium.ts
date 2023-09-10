/**
 * MIT License
 *
 * Copyright (c) 2023, Brion Mario
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export interface MediumApolloStateParagraph {
  __typename: string;
  codeBlockMetadata: unknown | null;
  dropCapImage: unknown | null;
  hasDropCap: boolean | null;
  href: string | null;
  id: string;
  iframe: unknown | null;
  layout: string | null;
  markups: unknown[][];
  metadata: unknown | null;
  mixtapeMetadata: unknown | null;
  name: string;
  text: string;
  type: string;
}

export interface MediumApolloStateTag {
  __typename: string;
  displayTitle: string;
  id: string;
  normalizedTagSlug: string;
}

export interface MediumApolloStateUser {
  __typename: string;
  allowNotes: boolean;
  atsQualifiedAt: number;
  authoredBooks: unknown[];
  bio: string;
  customDomainState: {
    __typename: string;
    live: {
      __typename: string;
      domain: string;
      isSubdomain: boolean;
      status: string;
    };
  };
  customStyleSheet: null | unknown;
  hasSubdomain: boolean;
  'homepagePostsConnection:{"paging":{"limit":1}}': {
    __typename: string;
    posts: [
      {
        __ref: string;
      },
    ];
  };
  id: string;
  imageId: string;
  isAuroraVisible: boolean;
  isPartnerProgramEnrolled: boolean;
  isSuspended: boolean;
  linkedAccounts: {
    __typename: string;
    mastodon: unknown | null;
  };
  mediumMemberAt: number;
  name: string;
  newsletterV3: {
    __ref: string;
  };
  postSubscribeMembershipUpsellShownAt: number;
  socialStats: {
    __typename: string;
    collectionFollowingCount: number;
    followerCount: number;
    followingCount: number;
  };
  twitterScreenName: string;
  username: string;
  verifications: {
    __typename: string;
    isBookAuthor: boolean;
  };
  viewerEdge: {
    __ref: string;
  };
  viewerIsUser: boolean;
}

export interface MediumApolloState {
  [key: string]: MediumApolloStateParagraph | MediumApolloStateTag | MediumApolloStateUser;
}

/**
 * An interface representing a Medium post in schema.org format.
 */
export interface MediumPostMetadata {
  /**
   * The context in which the news article is defined.
   */
  '@context': string;
  /**
   * The type of the news article, always "NewsArticle".
   */
  '@type': string;
  /**
   * The author of the news article.
   */
  author: {
    /**
     * The type of the author, always "Person".
     */
    '@type': string;
    /**
     * The name of the author.
     */
    name: string;
    /**
     * The URL of the author.
     */
    url: string;
  };
  /**
   * The creators of the news article.
   */
  creator: string[];
  /**
   * The date the news article was created.
   */
  dateCreated: string;
  /**
   * The date the news article was last modified.
   */
  dateModified: string;
  /**
   * The date the news article was published.
   */
  datePublished: string;
  /**
   * A short description of the news article.
   */
  description: string;
  /**
   * The headline of the news article.
   */
  headline: string;
  /**
   * The identifier of the news article.
   */
  identifier: string;
  /**
   * The image associated with the news article.
   */
  image: string[];
  /**
   * The main entity of the news article.
   */
  mainEntityOfPage: string;
  /**
   * The name of the news article.
   */
  name: string;
  /**
   * The publisher of the news article.
   */
  publisher: {
    /**
     * The type of the publisher, always "Organization".
     */
    '@type': string;
    /**
     * The logo of the publisher.
     */
    logo: {
      /**
       * The type of the logo, always "ImageObject".
       */
      '@type': string;
      /**
       * The height of the logo.
       */
      height: number;
      /**
       * The URL of the logo.
       */
      url: string;
      /**
       * The width of the logo.
       */
      width: number;
    };
    /**
     * The name of the publisher.
     */
    name: string;
    /**
     * The URL of the publisher.
     */
    url: string;
  };
  /**
   * The URL of the news article.
   */
  url: string;
}
