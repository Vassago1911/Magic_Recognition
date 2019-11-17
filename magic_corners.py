from skimage import filters

from skimage.feature import corner_harris, corner_peaks, corner_subpix
from skimage.color import rgb2gray

from skimage.filters.rank import threshold

import matplotlib.pyplot as plt
import os 

img = plt.imread('bird2.jpg')
img = rgb2gray(img)
img_ = filters.gaussian(img, sigma=5)

import numpy as np 
img = np.where( img_ < .3, 0, 1)

edges = filters.sobel(img)

low = .1; high = .2

hyst = filters.apply_hysteresis_threshold(edges, low, high)

#plt.imshow(hyst)
#plt.show()

res = corner_peaks(corner_harris(img, eps=1e-2), min_distance = 1)
#res = corner_subpix(hyst, res, window_size=13)

fig, ax = plt.subplots()
ax.imshow(img, cmap=plt.cm.gray)
ax.plot(res[:, 1], res[:, 0], color='cyan', marker='o',
         linestyle='None', markersize=6)

plt.show()

#print(res)