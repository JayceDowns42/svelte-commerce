import { id } from '$lib/config'
import { loadingDelayed } from '$lib/store'
// import Cookie from 'cookie-universal'

// const cookies = Cookie()

let typingTimer

const send = async ({ method, path, params, data, token, headers, origin }: any) => {
	if (
		path.includes('.png') ||
		path.includes('.jpg') ||
		path.includes('.svg') ||
		path.includes('.json') ||
		path.includes('.css') ||
		path.includes('dev-sw')
	) {
		return
	}

	// origin = origin || 'http://localhost:3000'
	// const storeId = id // cookies.get('store')?.id

	// if (headers && headers.get('cookie') && headers.get('cookie').includes('store')) {
	// 	origin = headers.get('origin') || headers.get('host')

	// 	if (origin === 'localhost:3000') origin = 'http://localhost:3000'

	// 	else origin = 'https://' + origin
	// 	// const cookie0 = headers.get('cookie')
	// 	// const cookies = cookie.parse(cookie0 || '')
	// 	// storeId = JSON.parse(cookies.store || '{}')?.id
	// } else {
	// }

	let uri = new URL(path, origin)

	if (!path.includes('/api/')) {
		// When microservice path provided
		uri = new URL('api/' + path, origin)
	}

	// const domain = uri.searchParams.get('domain')
	// const st = uri.searchParams.get('store')

	// if (!storeId && !domain && !st) {
	// 	console.error('store id not found in config', path)
	// 	// throw 'Loading...'
	// 	return
	// }

	const opts: any = {
		method
	}

	opts.headers = headers ? headers : { Cache: 'no-cache' }

	if (data) {
		// data.store = storeId //'6135b76e5dfeaf011301827d'
		const contentType = data?.files && data?.files[0]?.type

		if (
			!(
				contentType == 'application/msword' ||
				contentType == 'application/pdf' ||
				contentType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
				contentType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
				contentType == 'image/gif' ||
				contentType == 'image/ico' ||
				contentType == 'image/jpeg' ||
				contentType == 'image/png' ||
				contentType == 'image/svg' ||
				contentType == 'image/svg+xml' ||
				contentType == 'image/webp'
			)
		) {
			opts.headers['Content-Type'] = 'application/json'
			opts.body = JSON.stringify(data)
		} else {
			const form = new FormData()

			if (data && data.files) {
				for (const x of data.files) {
					form.append('files', x)
				}
			}
			for (const d in data) {
				if (d !== 'files') form.append(d, data[d])
			}
			opts.body = form
		}
	}

	if (token) {
		opts.headers['Authorization'] = `Bearer ${token}`
	}

	// else if (tkn) {
	// 	opts.headers['Authorization'] = `Bearer ${tkn}`
	// }

	if (!params) {
		params = {}
	}

	// if (storeId) params.store = storeId //'6135b76e5dfeaf011301827d'

	if (params) {
		Object.keys(params).forEach((key) => uri.searchParams.append(key, params[key]))
	}

	const url = uri.toString()

	startDelayedLoadingIndicator()

	// alert(JSON.stringify(url))
	// alert(JSON.stringify(opts))

	const response = await fetch(url, opts)

	cancelDelayedLoadingIndicator()

	const isJson = response.headers.get('content-type')?.includes('application/json')

	const res = isJson ? await response.json() : await response.text()

	if (res?.status > 399) {
		throw { status: res.status, message: res }
	} else if (response?.status > 399) {
		throw { status: response.status, message: res }
	} else {
		return res
	}
}

export const getAPI = (path: string, origin: string, headers?) => {
	return send({ method: 'GET', path, origin, headers })
}

export const del = (path: string, origin: string, headers?) => {
	return send({ method: 'DELETE', path, origin, headers })
}

export const post = (path: string, data, origin: string, headers?) => {
	return send({ method: 'POST', path, data, origin, headers })
}

export const put = (path: string, data, origin: string, headers?) => {
	return send({ method: 'PUT', path, data, origin, headers })
}

const startDelayedLoadingIndicator = async () => {
	clearTimeout(typingTimer)
	typingTimer = setTimeout(() => {
		loadingDelayed.set(true)
	}, 5000)
}

const cancelDelayedLoadingIndicator = async () => {
	clearTimeout(typingTimer)
	loadingDelayed.set(false)
}
