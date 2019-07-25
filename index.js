/**
 * RegExp for basic auth credentials
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 */

// Global username for KV lookup
var username = ""

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/

/**
 * RegExp for basic auth user/pass
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 */

const USER_PASS_REGEXP = /^([^:]*):(.*)$/

/**
 * Object to represent user credentials.
 */

const Credentials = function(name, pass) {
    this.name = name
    this.pass = pass    
}

/**
 * Decode base64 string.
 */

const decodeBase64 = function(str) {
  return new Buffer(str, 'base64').toString()
}

/**
 * Parse basic auth to object.
 */

const parseAuthHeader = function(string) {
  if (typeof string !== 'string') {
    return undefined
  }

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string)

  if (!match) {
    return undefined
  }

  // decode user pass
  const userPass = USER_PASS_REGEXP.exec(decodeBase64(match[1]))

  if (!userPass) {
    return undefined
  }

    // return credentials object
    username = userPass[1]
  return new Credentials(userPass[1], userPass[2])
}


const unauthorizedResponse = function(body) {
  return new Response(
    null, {
      status: 401,
      statusText: "'Authentication required.'",
      body: body,
      headers: {
        "WWW-Authenticate": 'Basic realm="User Visible Realm"'
      }
    }
  )
}

/**
 * Handle request
 */

async function handle(request) {

    // Testing
    //const NAME = "super"
    //const PASS = "secret"
    
    const credentials = parseAuthHeader(request.headers.get("Authorization"))

    // Lookup username in webauth KV key=>username, value=>password
    let passcheck = await webauth.get(username)

    // Check if password matches kv password
    if ( !credentials  ||  credentials.pass !== passcheck) {
	return unauthorizedResponse("Unauthorized")
    } else {
	return fetch(request)
    }
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})

