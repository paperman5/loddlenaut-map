import math
from pathlib import Path
from multiprocessing import Pool
from PIL import Image, ImageChops
from natsort import natsorted
import numpy as np
from matplotlib import pyplot as plt

SCREENSHOT_DIR = Path("D:/LoddlenautScreenshots")
MAP_DIR = Path("D:/LoddlenautMap") / "map"
TILE_WIDTH = 256
TILE_HEIGHT = 256
# Map from Leaflet zoom level to native screenshot zoom level & scale factor
ZOOM_MAPPING : dict[int : tuple[int, float]] = {
    0 : (5, 0.5),
    1 : (4, 0.5),
    2 : (3, 0.5),
    3 : (2, 0.5),
    4 : (1, 0.5),
    5 : (0, 0.5),
    6 : (0, 1.0),
}
TRANSPARENT : dict[int : Image] = {
    256 : Image.fromarray(np.zeros((256, 256, 4), dtype=np.uint8)),
    512 : Image.fromarray(np.zeros((512, 512, 4), dtype=np.uint8)),
    2160 : Image.fromarray(np.zeros((2160, 2160, 4), dtype=np.uint8)),
}


def main():
    # Get the native-res image filenames and structure them in a dict
    screenshots : dict[int : dict[str : dict]] = {x : {} for x in range(6)}
    for i in range(6):
        # For each layer, get a (naturally sorted) list of filenames and use the tile index as the dict key
        images = natsorted(list(SCREENSHOT_DIR.glob(f'*-surface-{i}.png')))
        screenshots[i]['surface'] = {int(x.name.split('-')[0]) : x for x in images}
        images = natsorted(list(SCREENSHOT_DIR.glob(f'*-hollow-{i}.png')))
        screenshots[i]['hollow']  = {int(x.name.split('-')[0]) : x for x in images}
        images = natsorted(list(SCREENSHOT_DIR.glob(f'*-cave-{i}.png')))
        screenshots[i]['cave']    = {int(x.name.split('-')[0]) : x for x in images}
    del images, i

    # Give some meta-information about each zoom level
    screenshots[0]['meta'] = {
        'rows' : 15,
        'cols' : 13,
        'image_size' : (3840, 2160)
    }
    screenshots[1]['meta'] = {
        'rows' : 8,
        'cols' : 7,
        'image_size' : (3840, 2160)
    }
    screenshots[2]['meta'] = {
        'rows' : 4,
        'cols' : 4,
        'image_size' : (3840, 2160)
    }
    screenshots[3]['meta'] = {
        'rows' : 2,
        'cols' : 2,
        'image_size' : (3840, 2160)
    }
    screenshots[4]['meta'] = {
        'rows' : 2,
        'cols' : 2,
        'image_size' : (3840, 2160)
    }
    screenshots[5]['meta'] = {
        'rows' : 1,
        'cols' : 1,
        'image_size' : (3840, 2160)
    }

    for zoom_level in range(7):
        meta = screenshots[ZOOM_MAPPING[zoom_level][0]]['meta']
        tile_pixel_size = (int(TILE_WIDTH / ZOOM_MAPPING[zoom_level][1]), int(TILE_HEIGHT / ZOOM_MAPPING[zoom_level][1]))
        n_cols = math.ceil(float(meta['cols'] * meta['image_size'][0]) / tile_pixel_size[0])
        n_rows = math.ceil(float(meta['rows'] * meta['image_size'][1]) / tile_pixel_size[1])

        coords = [(col, row) for row in range(n_rows) for col in range(n_cols)]
        args = [(coord, zoom_level, screenshots, tile_pixel_size) for coord in coords]
        with Pool(10) as pool:
            pool.starmap(save_tile, args)
        
        # for coord in coords:
        #     save_tile(coord, zoom_level, screenshots, tile_pixel_size)
    
    # redo = [
    #     (3, 9, 10),
    #     (3, 10, 11),
    #     (4, 21, 22),
    #     (5, 39, 41),
    #     (5, 41, 42),
    #     (5, 42, 44),
    #     (6, 79, 83),
    #     (6, 83, 85),
    #     (6, 85, 86),
    #     (6, 85, 88),
    # ]
    # for tile in redo:
    #     zoom_level = tile[0]
    #     tile_pixel_size = (int(TILE_WIDTH / ZOOM_MAPPING[zoom_level][1]), int(TILE_HEIGHT / ZOOM_MAPPING[zoom_level][1]))
    #     save_tile((tile[1], tile[2]), zoom_level, screenshots, tile_pixel_size)

def save_tile(coords : tuple[int, int], zoom_level: int, screenshots : dict, tile_size : tuple[int, int]):
    """Saves a section of the given screenshots as a tile, resizing as necessary"""
    (col, row) = coords
    tile_dirs = {layer : MAP_DIR / layer / str(zoom_level) / str(col) for layer in ['surface', 'hollow', 'cave']}
    tile_name = f"{row}.webp"

    # load 3x3 tile area to make sure resizing is correct around tile borders
    rect = ((col-1) * tile_size[0], (row-1) * tile_size[1], tile_size[0] * 3, tile_size[1] * 3)
    surface = load_pixel_rect_from_images(rect, screenshots[ZOOM_MAPPING[zoom_level][0]], 'surface')
    hollow = load_pixel_rect_from_images(rect, screenshots[ZOOM_MAPPING[zoom_level][0]], 'hollow')
    cave = load_pixel_rect_from_images(rect, screenshots[ZOOM_MAPPING[zoom_level][0]], 'cave')
    
    # Only save the hollow layer if it is different than the surface layer
    # Do the hollow layer first because the surface layer is modified later
    hollow = Image.alpha_composite(surface, hollow)
    if not is_identical(surface.crop((*tile_size, tile_size[0]*2, tile_size[1]*2)), hollow.crop((*tile_size, tile_size[0]*2, tile_size[1]*2))):

        if tile_size != (TILE_WIDTH, TILE_HEIGHT):
            hollow = resize_srgb_aware(hollow, (TILE_WIDTH * 3, TILE_HEIGHT * 3), Image.Resampling.LANCZOS)

        if not tile_dirs['hollow'].exists():
            tile_dirs['hollow'].mkdir(parents=True)
        
        hollow_tile = hollow.crop((TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH*2, TILE_HEIGHT*2))
        hollow_tile.save(tile_dirs['hollow'] / tile_name, lossless=True, quality=100, method=4)
        print(f"Saved 'hollow' tile {coords} zoom {zoom_level}")
    
    # Only save the surface layer if it is not transparent
    if not is_identical(surface.crop((*tile_size, tile_size[0]*2, tile_size[1]*2)), TRANSPARENT[tile_size[1]]):
    
        if tile_size != (TILE_WIDTH, TILE_HEIGHT):
            surface = resize_srgb_aware(surface, (TILE_WIDTH * 3, TILE_HEIGHT * 3), Image.Resampling.LANCZOS)

        if not tile_dirs['surface'].exists():
            tile_dirs['surface'].mkdir(parents=True)
        
        surface_tile = surface.crop((TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH*2, TILE_HEIGHT*2))
        surface_tile.save(tile_dirs['surface'] / tile_name, lossless=True, quality=100, method=4)
        print(f"Saved 'surface' tile {coords} zoom {zoom_level}")
    
    # Only save the cave layer if it is not transparent
    if not is_identical(cave.crop((*tile_size, tile_size[0]*2, tile_size[1]*2)), TRANSPARENT[tile_size[1]]):

        if tile_size != (TILE_WIDTH, TILE_HEIGHT):
            cave = resize_srgb_aware(cave, (TILE_WIDTH * 3, TILE_HEIGHT * 3), Image.Resampling.LANCZOS)

        if not tile_dirs['cave'].exists():
            tile_dirs['cave'].mkdir(parents=True)
        
        cave_tile = cave.crop((TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH*2, TILE_HEIGHT*2))
        cave_tile.save(tile_dirs['cave'] / tile_name, lossless=True, quality=100, method=4)
        print(f"Saved 'cave' tile {coords} zoom {zoom_level}")


def is_identical(img1 : Image, img2 : Image) -> bool:
    return ImageChops.subtract(img1, img2, 1, -3).getbbox(alpha_only=False) == None
    #return ImageChops.difference(img1, img2).getbbox(alpha_only=False) == None


def load_pixel_rect_from_images(rect : tuple[int,int,int,int], images : dict[str : dict], layer : str) -> Image:
    """Returns an Image containing the given (x,y,w,h) rect in the theoretical merged screenshot map image."""
    image_size = images['meta']['image_size']
    tile_extents = (images['meta']['cols'], images['meta']['rows'])
    # Get the screenshot row & columns for each corner of the rect
    rect_indices = (
        get_native_tile_index((rect[0], rect[1]), image_size, tile_extents),
        get_native_tile_index((rect[0]+rect[2], rect[1]), image_size, tile_extents),
        get_native_tile_index((rect[0], rect[1]+rect[3]), image_size, tile_extents),
        get_native_tile_index((rect[0]+rect[2], rect[1]+rect[3]), image_size, tile_extents)
    )
    rect_new = (
        rect[0] % image_size[0] if rect[0] > 0 else rect[0], 
        rect[1] % image_size[1] if rect[1] > 0 else rect[1], 
        rect[2], 
        rect[3]
    )
    corners = (rect_new[0], rect_new[1], rect_new[0]+rect_new[2], rect_new[1]+rect_new[3])

    img = load_image_index(images[layer], rect_indices[0]).crop(corners)

    if rect_indices[1] > rect_indices[0]:
        # Image extends too far to the right, add in a chunk of the next screenshot to the right
        corners = (rect_new[0]-image_size[0], rect_new[1], rect_new[0]+rect_new[2]-image_size[0], rect_new[1]+rect_new[3])
        img2 = load_image_index(images[layer], rect_indices[1]).crop(corners)
        img.alpha_composite(img2)
        #print(f"\t{corners}")
    if rect_indices[2] > rect_indices[0]:
        # Image extends too far to the bottom, add in a chunk of the next screenshot below
        corners = (rect_new[0], rect_new[1]-image_size[1], rect_new[0]+rect_new[2], rect_new[1]+rect_new[3]-image_size[1])
        img2 = load_image_index(images[layer], rect_indices[2]).crop(corners)
        img.alpha_composite(img2)
        #print(f"\t{corners}")
    if rect_indices[3] > rect_indices[1] and rect_indices[3] > rect_indices[2]:
        # Image extends right & down, add in a corner chunk from the diagonally down image
        corners = (rect_new[0]-image_size[0], rect_new[1]-image_size[1], rect_new[0]+rect_new[2]-image_size[0], rect_new[1]+rect_new[3]-image_size[1])
        img2 = load_image_index(images[layer], rect_indices[3]).crop(corners)
        img.alpha_composite(img2)
        #print(f"\t{corners}")

    return img
    

def get_native_tile_coords_of_pixel(pos : tuple[int, int], image_size : tuple[int, int], tile_extents = tuple[int, int]) -> tuple[int, int]:
    """Returns an (x, y) tuple of the screenshot column & row the given pixel is in."""
    col = min(max(pos[0] // image_size[0], 0), tile_extents[0] - 1)
    row = min(max(pos[1] // image_size[1], 0), tile_extents[1] - 1)
    return (col, row)


def get_tile_index(col : int, row : int, n_cols : int) -> int:
    """Converts an (x, y) position into a linear index."""
    return (row * n_cols) + col


def get_native_tile_index(pos : tuple[int, int], image_size : tuple[int, int], tile_extents = tuple[int, int]) -> int:
    """Return the linear index of the screenshot the given pixel is in."""
    coords = get_native_tile_coords_of_pixel(pos, image_size, tile_extents)
    return get_tile_index(coords[0], coords[1], tile_extents[0])


def load_image(path) -> Image:
    """Load a PIL image with RGBA encoding."""
    img = Image.open(path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return img


def load_image_index(path_dict : dict, index : int) -> Image:
    """Load a PIL image with RGBA encoding."""
    if not index in path_dict:
        return TRANSPARENT[2160]
    img = Image.open(path_dict[index])
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return img


def resize_srgb_aware(img : Image, size : tuple[int,int], filter : Image.Resampling) -> Image:
    """Resizes an image with gamma correction."""
    # Convert to numpy array of float
    arr = np.array(img, dtype = np.float32) / 255.0
    # Convert sRGB -> linear (no alpha conversion)
    arr[0:3] = np.where(arr[0:3] <= 0.04045, arr[0:3] / 12.92, ((arr[0:3] + 0.055) / 1.055) ** 2.4)
    # Resize using PIL
    arrOut = np.zeros((size[1], size[0], arr.shape[2]))
    for i in range(arr.shape[2]):
        arrOut[:, :, i] = _resize_channel(arr[:, :, i], size, filter)
    # Convert linear -> sRGB
    arrOut[0:3] = np.where(arrOut[0:3] <= 0.0031308, 12.92 * arrOut[0:3], 1.055 * arrOut[0:3] ** (1.0 / 2.4) - 0.055)
    # Convert to 8-bit
    arrOut = np.uint8(np.rint(arrOut * 255.0))
    # Convert back to PIL
    return Image.fromarray(arrOut)


def _resize_channel(arr : np.ndarray, size : tuple[int, int], filter : Image.Resampling) -> np.ndarray:
    chan = Image.fromarray(arr)
    chan = chan.resize(size, filter)
    return np.array(chan).clip(0.0, 1.0)


if __name__ == '__main__':
    main()