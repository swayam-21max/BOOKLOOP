import * as THREE from 'three';

/**
 * Helper to create a consistent book mesh with cover and pages.
 * @param {number} color - Hex color for the cover
 * @param {boolean} isCenter - Whether this is the main center book
 */
export const createBookMesh = (color, isCenter = false) => {
  const group = new THREE.Group();
  const scale = isCenter ? 1.5 : 1;

  // Cover
  const coverGeo = new THREE.BoxGeometry(0.8 * scale, 1.1 * scale, 0.2 * scale);
  const coverMat = new THREE.MeshStandardMaterial({ 
    color: color,
    roughness: 0.3,
    emissive: isCenter ? color : 0x000000,
    emissiveIntensity: isCenter ? 0.3 : 0
  });
  const cover = new THREE.Mesh(coverGeo, coverMat);
  group.add(cover);

  // Pages
  const pageGeo = new THREE.BoxGeometry(0.75 * scale, 1.05 * scale, 0.18 * scale);
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
  const pages = new THREE.Mesh(pageGeo, pageMat);
  pages.position.set(0.01 * scale, 0, 0);
  group.add(pages);

  return group;
};
