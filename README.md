# freeCodeCamp - URL Shortener Microservice Project

## Summary

This is one of the projects that requires implementation as part of [freeCodeCamp's Back End Development and APIs Certification](https://www.freecodecamp.org/learn/back-end-development-and-apis/).

As part of the [requirements](https://www.freecodecamp.org/learn/back-end-development-and-apis/back-end-development-and-apis-projects/url-shortener-microservice) (including utilising the [boilerplate code provided by freeCodeCamp](https://github.com/freeCodeCamp/boilerplate-project-urlshortener/)), this project involves implementing an application where a user can post/save a given URL and be given a `short_url` value that they can then use via API to redirect to the URL they provided.

## Setup

As this project uses Node.js and Express in order to run this application, make sure Node.js and npm are installed beforehand.

This appliaction also uses MongoDB for database purposes. As such, alongside creating a new database in MongoDB, you will need to add a `.env` file in your project's directory that has a `MONGO_URI` variable that references your MongoDB database's URI in quotes. This should be similar to as follows:

`MONGO_URI="mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER-NAME>.prx1c.mongodb.net/<DB-NAME>?retryWrites=true&w=majority"`

Once everything is set up, run the following commands in your terminal within the project's directory:

```
npm install
npm start
```

## Usage

### POST API / Post URL

`<YOUR_PROJECT_URL>/api/shorturl` (URL provided in the request's body)

As an example, user provides `https://freeCodeCamp.org` in the input field before clicking "POST URL".

#### Output

```json
{
  "original_url" : "https://freeCodeCamp.org",
  "short_url" : 1
}
```

### GET API / Redirect via ShortURL

`<YOUR_PROJECT_URL>/api/shorturl/<short_url>`

Using the above as an example:

`<YOUR_PROJECT_URL>/api/shorturl/1`

#### Output

Redirects user to `https://freeCodeCamp.org`.

## Notes

- The URL must be in the valid example format: `http://www.example.com`.
- The application validates the URL using dns.lookup in order to verify that the hostname exists, returning an error if it does not. Of note, there may be a scenario where a non-existent URL could be considered valid if the hostname exists. However, this is fine for the purposes of this project's requirements and could be considered as part of potential future improvement.
- If the given URL exists in the database, it will retrieve the URL's record and provide it to the user as a JSON object. Otherwise, it will create a new record (with its `short_url` being incremented from the value used in the most recently saved record), before retrieving and providing it to the user.
- Whether or not a given URL exists in the database depends explictly on the URL provided (including the type of HTTP connection used). As such, `http://freeCodeCamp.org` and `https://freeCodeCamp.org` would result in two separate database records (as well as two different `short_url` values).
- If user calls the GET API using a `short_url` number that does not exist in the database, the application will return an error as a JSON object stating `No short URL found for the given input`.
