export async function supportsAvif() {
	if (!createImageBitmap) return false

	const avifData = `data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgADkgQEDQgMgkf8AAAQAAAr7A=`

	return createImageBitmap(await fetch(avifData).then(r => r.blob()))
		.then(() => true)
		.catch(() => false)
}

export async function supportsWebp() {
	if (!createImageBitmap) return false

	const webpData = `data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAkAAAAvAAAAAIiI/gcA`

	return createImageBitmap(await fetch(webpData).then(r => r.blob()))
		.then(() => true)
		.catch(() => false)
}
