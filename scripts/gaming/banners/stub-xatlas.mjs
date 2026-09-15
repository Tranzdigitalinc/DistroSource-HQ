// three-gpu-pathtracer lists `xatlas-web` as an optional peer for UV
// unwrapping lightmaps. Product scenes never unwrap, so the stage maps the
// import here instead of installing it.
export class XAtlas {
  constructor() {
    throw new Error("xatlas-web is not available in the banner stage")
  }
}
export default {}
