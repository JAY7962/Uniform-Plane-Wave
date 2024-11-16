import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css'

const App = () => {
  const mountRef = useRef(null);
  const [direction, setDirection] = useState({ x: 1, y: 0, z: 0 });
  const [unitVector, setUnitVector] = useState({ x: 1, y: 0, z: 0 });
  const [amplitude, setAmplitude] = useState(0);
  const [frequency, setFrequency] = useState(2);
  const [wavelength, setWavelength] = useState(1);
  const [muR, setMuR] = useState(1.0);
  const [epsilonR, setEpsilonR] = useState(1);
  const [hAmplitude, setHAmplitude] = useState(0);
  const [sineWaveDirection, setSineWaveDirection] = useState({ x: 0, y: 1, z: 0 });
  const [cosineWaveDirection, setCosineWaveDirection] = useState({ x: 0, y: 0, z: 1 });
  const k1 = 120 * Math.PI * Math.sqrt(muR / epsilonR);
  const [showError, setShowError] = useState(false);
  const [tempDirection, setTempDirection] = useState({ x: 1, y: 0, z: 0 });
  const [tempSineWaveDirection, setTempSineWaveDirection] = useState({ x: 0, y: 1, z: 0 });

  // Update amplitude whenever sineWaveDirection changes
  useEffect(() => {
    const newAmplitude = Math.sqrt(
      sineWaveDirection.x ** 2 + 
      sineWaveDirection.y ** 2 + 
      sineWaveDirection.z ** 2
    );
    setAmplitude(newAmplitude);
  }, [sineWaveDirection]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const arrowDirection = new THREE.Vector3(direction.x, direction.y, direction.z);
    const normalizedDirection = arrowDirection.clone().normalize();
    setUnitVector({
      x: normalizedDirection.x.toFixed(2),
      y: normalizedDirection.y.toFixed(2),
      z: normalizedDirection.z.toFixed(2),
    });

    const arrowHelper = new THREE.ArrowHelper(
      normalizedDirection,
      new THREE.Vector3(0, 0, 0),
      5,
      0xeaff00,
      0.3,
      0.1
    );
    scene.add(arrowHelper);

    const axesLength = 5;
    const axesThickness = 1;

    const axes = new THREE.Group();
    const xGeometry = new THREE.CylinderGeometry(axesThickness / 50, axesThickness / 50, axesLength, 32);
    const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const xAxis = new THREE.Mesh(xGeometry, xMaterial);
    xAxis.rotation.z = -Math.PI / 2;
    xAxis.position.x = axesLength / 2;
    axes.add(xAxis);

    const yGeometry = new THREE.CylinderGeometry(axesThickness / 50, axesThickness / 50, axesLength, 32);
    const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const yAxis = new THREE.Mesh(yGeometry, yMaterial);
    yAxis.position.y = axesLength / 2;
    axes.add(yAxis);

    const zGeometry = new THREE.CylinderGeometry(axesThickness / 50, axesThickness / 50, axesLength, 32);
    const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const zAxis = new THREE.Mesh(zGeometry, zMaterial);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.z = axesLength / 2;
    axes.add(zAxis);

    scene.add(axes);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    camera.position.set(4, 4, 4);
    camera.lookAt(0, 0, 0);

    const numberOfPoints = 40;

    const sineWaveGeometry = new THREE.BufferGeometry();
    const cosineWaveGeometry = new THREE.BufferGeometry();
    const sinePositions = new Float32Array(numberOfPoints * 3);
    const cosinePositions = new Float32Array(numberOfPoints * 3);
    sineWaveGeometry.setAttribute('position', new THREE.BufferAttribute(sinePositions, 3));
    cosineWaveGeometry.setAttribute('position', new THREE.BufferAttribute(cosinePositions, 3));

    const sineWaveMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });
    const cosineWaveMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff });
    const sineWaveLine = new THREE.Line(sineWaveGeometry, sineWaveMaterial);
    const cosineWaveLine = new THREE.Line(cosineWaveGeometry, cosineWaveMaterial);
    scene.add(sineWaveLine);
    scene.add(cosineWaveLine);

    const sineArrows = [];
    const cosineArrows = [];
    for (let i = 0; i < numberOfPoints; i++) {
      const sineArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0.2, 0xff00ff);
      const cosineArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), 0.2, 0x00ffff);
      scene.add(sineArrow);
      scene.add(cosineArrow);
      sineArrows.push(sineArrow);
      cosineArrows.push(cosineArrow);
    }

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      const k = 120 * Math.PI * Math.sqrt(muR / epsilonR);
      setHAmplitude(amplitude / k);

      const sinePositions = sineWaveLine.geometry.attributes.position.array;
      const cosinePositions = cosineWaveLine.geometry.attributes.position.array;
      const normalizedDir = new THREE.Vector3(direction.x, direction.y, direction.z).normalize();

      // const tempVector = new THREE.Vector3(1, 0, 0);
      // if (Math.abs(normalizedDir.dot(tempVector)) > 0.99) {
      //   tempVector.set(0, 1, 0);
      // }

      // Use sineWaveDirection without normalization
      const waveDirection1 = new THREE.Vector3(
        sineWaveDirection.x, 
        sineWaveDirection.y, 
        sineWaveDirection.z
      );

      // Calculate waveDirection2 as cross product without normalization
      const waveDirection2 = new THREE.Vector3()
        .crossVectors(normalizedDir, waveDirection1);

      for (let i = 0; i < numberOfPoints; i++) {
        const t = (i / (numberOfPoints - 1)) * wavelength * 2 * Math.PI;
        const sineWaveOffset = Math.cos(frequency * (t - time)) * amplitude;
        const cosineWaveOffset = Math.cos(frequency * (t - time)) * (amplitude / k) * 100;

        const basePoint = normalizedDir.clone().multiplyScalar(i / (numberOfPoints - 1) * 5);

        // Update sine wave (E-field)
        const sineFinalPosition = basePoint.clone().add(
          waveDirection1.normalize().clone().multiplyScalar(sineWaveOffset)
        );
        sinePositions[i * 3] = sineFinalPosition.x;
        sinePositions[i * 3 + 1] = sineFinalPosition.y;
        sinePositions[i * 3 + 2] = sineFinalPosition.z;

        // Update cosine wave (H-field)
        const cosineFinalPosition = basePoint.clone().add(
          waveDirection2.normalize().clone().multiplyScalar(cosineWaveOffset)
        );
        cosinePositions[i * 3] = cosineFinalPosition.x;
        cosinePositions[i * 3 + 1] = cosineFinalPosition.y;
        cosinePositions[i * 3 + 2] = cosineFinalPosition.z;

        // Update arrows with oscillating lengths
        sineArrows[i].position.copy(basePoint);
        sineArrows[i].setDirection(waveDirection1.clone().multiplyScalar(Math.sign(sineWaveOffset)));
        sineArrows[i].setLength(Math.abs(sineWaveOffset), 0.1, 0.05);

        cosineArrows[i].position.copy(basePoint);
        cosineArrows[i].setDirection(waveDirection2.clone().multiplyScalar(Math.sign(cosineWaveOffset)));
        cosineArrows[i].setLength(Math.abs(cosineWaveOffset), 0.1, 0.05);
      }

      // Calculate cross product of sineWaveDirection and normalizedDir
      const crossProduct = new THREE.Vector3()
        .crossVectors(
          new THREE.Vector3(sineWaveDirection.x, sineWaveDirection.y, sineWaveDirection.z),
          normalizedDir
        );

      // Update cosineWaveDirection with the cross product
      setCosineWaveDirection({
        x: crossProduct.x.toFixed(2),
        y: crossProduct.y.toFixed(2),
        z: crossProduct.z.toFixed(2),
      });

      sineWaveLine.geometry.attributes.position.needsUpdate = true;
      cosineWaveLine.geometry.attributes.position.needsUpdate = true;

      time += 0.05;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Create text labels for axes
    const createTextLabel = (text, color) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = '72px Arial';
      context.fillStyle = color;
      context.fillText(text, 0, 72);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(1.5, 0.75, 1);
      return sprite;
    };

    const xLabel = createTextLabel('X', '#ff0000');
    xLabel.position.set(axesLength + 0.8, 0, 0);
    scene.add(xLabel);

    const yLabel = createTextLabel('Y', '#00ff00');
    yLabel.position.set(0, axesLength + 0.01, 0);
    scene.add(yLabel);

    const zLabel = createTextLabel('Z', '#0000ff');
    zLabel.position.set(0, 0, axesLength + 0.001);
    scene.add(zLabel);

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
    };
  }, [direction, amplitude, frequency, wavelength, muR, epsilonR, sineWaveDirection]);

  const checkPerpendicularity = (dir, eField) => {
    const dirVector = new THREE.Vector3(dir.x, dir.y, dir.z);
    const eVector = new THREE.Vector3(eField.x, eField.y, eField.z);
    
    // Calculate dot product
    const dotProduct = dirVector.dot(eVector);
    
    // Check if vectors are nearly parallel (dot product close to 0)
    return Math.abs(dotProduct) < 0.1;
  };

  const handleDirectionChange = (axis, value) => {
    if (value === '' || value === '-' || !isNaN(value)) {
      setTempDirection({
        ...tempDirection,
        [axis]: value === '' || value === '-' ? value : parseFloat(value)
      });
    }
  };

  const handleSineWaveDirectionChange = (axis, value) => {
    if (value === '' || value === '-' || !isNaN(value)) {
      setTempSineWaveDirection({
        ...tempSineWaveDirection,
        [axis]: value === '' || value === '-' ? value : parseFloat(value)
      });
    }
  };

  const handleFrequencyChange = (value) => {
    setFrequency(parseFloat(value));
  };

  const handleSubmit = () => {
    // Convert empty strings to 0
    const finalDirection = {
      x: tempDirection.x === '' || tempDirection.x === '-' ? 0 : parseFloat(tempDirection.x),
      y: tempDirection.y === '' || tempDirection.y === '-' ? 0 : parseFloat(tempDirection.y),
      z: tempDirection.z === '' || tempDirection.z === '-' ? 0 : parseFloat(tempDirection.z)
    };

    const finalSineWaveDirection = {
      x: tempSineWaveDirection.x === '' || tempSineWaveDirection.x === '-' ? 0 : parseFloat(tempSineWaveDirection.x),
      y: tempSineWaveDirection.y === '' || tempSineWaveDirection.y === '-' ? 0 : parseFloat(tempSineWaveDirection.y),
      z: tempSineWaveDirection.z === '' || tempSineWaveDirection.z === '-' ? 0 : parseFloat(tempSineWaveDirection.z)
    };

    if (!checkPerpendicularity(finalDirection, finalSineWaveDirection)) {
      setShowError(true);
      // Reset to default values
      setTempDirection({ x: 1, y: 0, z: 0 });
      setTempSineWaveDirection({ x: 0, y: 1, z: 0 });
      setDirection({ x: 1, y: 0, z: 0 });
      setSineWaveDirection({ x: 0, y: 1, z: 0 });
      return;
    }
    
    // If perpendicular, update the actual values
    setDirection(finalDirection);
    setSineWaveDirection(finalSineWaveDirection);
  };

  return (
    <div className="three-container">
      <div className="title">Uniform Plane Wave</div>
      <div ref={mountRef} className="three-container" />
      
      <div className="controls">
        <label>
          <span>Direction X:</span>
          <input 
            type="text"
            value={tempDirection.x}
            onChange={(e) => handleDirectionChange('x', e.target.value)}
          />
        </label>
        <label>
          <span>Direction Y:</span>
          <input 
            type="text"
            value={tempDirection.y}
            onChange={(e) => handleDirectionChange('y', e.target.value)}
          />
        </label>
        <label>
          <span>Direction Z:</span>
          <input 
            type="text"
            value={tempDirection.z}
            onChange={(e) => handleDirectionChange('z', e.target.value)}
          />
        </label>
        <label>
          <span>Frequency:</span>
          <input type="number" step="0.1" value={frequency} onChange={(e) => handleFrequencyChange(e.target.value)} />
        </label>
        <label>
          <span>&mu;<sub>r</sub> :</span>
          <input 
            type="text"
            value={muR}
            onChange={(e) => {
              const value = e.target.value;
              setMuR(value === '' ? 0 : parseFloat(value));
            }}
          />
        </label>
        <label>
          <span>&epsilon;<sub>r</sub> :</span>
          <input 
            type="text"
            value={epsilonR}
            onChange={(e) => {
              const value = e.target.value;
              setEpsilonR(value === '' ? 0 : parseFloat(value));
            }}
          />
        </label>
        <label>
          <span>E<sub>X</sub> :</span>
          <input 
            type="text"
            value={tempSineWaveDirection.x}
            onChange={(e) => handleSineWaveDirectionChange('x', e.target.value)}
          />
        </label>
        <label>
          <span>E<sub>Y</sub> :</span>
          <input 
            type="text"
            value={tempSineWaveDirection.y}
            onChange={(e) => handleSineWaveDirectionChange('y', e.target.value)}
          />
        </label>
        <label>
          <span>E<sub>Z</sub> :</span>
          <input 
            type="text"
            value={tempSineWaveDirection.z}
            onChange={(e) => handleSineWaveDirectionChange('z', e.target.value)}
          />
        </label>
        <button className="submit-button" onClick={handleSubmit}>
          Submit Changes
        </button>
      </div>

      <div className="info-box">
        <div className="unit-vector">
          <strong>Unit Vector:</strong> 
          ({unitVector.x}, {unitVector.y}, {unitVector.z})
        </div>
        <div className="wave-colors">
          <strong style={{width:"100%"}}> Wave Colors:</strong>
          <div><span style={{ color: '#ff00ff' }}>■</span> E Field</div>
          <div><span style={{ color: '#00ffff' }}>■</span> H Field</div>
        </div>
        <div className="wave-directions">
          <strong style={{width:"100%"}}>Wave Directions:</strong>
          <div>E Field: ({sineWaveDirection.x}, {sineWaveDirection.y}, {sineWaveDirection.z})</div>
          <div>H Field: ({cosineWaveDirection.x}, {cosineWaveDirection.y}, {cosineWaveDirection.z})</div>
        </div>
        <div>
          <strong>|E| (V/m) =<span style={{marginLeft:'10px'}}>{amplitude.toFixed(2)} </span></strong> 
        </div>
        <div>
          <strong>|H| (A/m) = <span style={{display:"inline-block",marginLeft:'7px', width:"20px"}}>{(amplitude / k1).toFixed(8)}</span></strong> 
        </div> 
        <div>
          <strong>η<sub>0</sub> = <span style={{marginLeft:'10px'}}>{k1.toFixed(4)}</span></strong> 
        </div>
      </div>

      {showError && (
        <div className="error-popup">
          <div className="error-content">
            <h3>Error</h3>
            <p>Direction vector and E field must be perpendicular!</p>
            <button onClick={() => setShowError(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;