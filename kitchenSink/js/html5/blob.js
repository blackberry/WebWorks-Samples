/*
 * Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

document.ontouchstart = function(event) {
    event.preventDefault();
}

document.ontouchmove = function(event) {
    event.preventDefault();
}

document.ontouchend = function(event) {
    event.preventDefault();
}

function Vector(x, y)
  {
    this.x = x; 
    this.y = y; 
    
    this.equal = function(v)
    {
      return this.x == v.getX() && this.y == v.getY(); 
    }
    this.getX = function()
    {
      return this.x; 
    }
    this.getY = function()
    {
      return this.y; 
    }
    this.setX = function(x)
    {
      this.x = x; 
    }
    this.setY = function(y)
    {
      this.y = y; 
    }
    this.addX = function(x)
    {
      this.x += x; 
    }
    this.addY = function(y)
    {
      this.y += y; 
    }
    this.set = function(v)
    {
      this.x = v.getX(); 
      this.y = v.getY(); 
    }
    this.add = function(v)
    {
      this.x += v.getX(); 
      this.y += v.getY(); 
    }
    this.sub = function(v)
    {
      this.x -= v.getX(); 
      this.y -= v.getY(); 
    }
    this.dotProd = function(v)
    {
      return this.x * v.getX() + this.y * v.getY(); 
    }
    this.length = function()
    {
      return Math.sqrt(this.x * this.x + this.y * this.y); 
    }
    this.scale = function(scaleFactor)
    {
      this.x *= scaleFactor; 
      this.y *= scaleFactor; 
    }
    this.toString = function()
    {
      return " X: " + this.x + " Y: " + this.y; 
    }
  }
  
  function Environment(x, y, w, h)
  {
    this.left = x;   
    this.right = x + w;   
    this.top = y;   
    this.buttom = y + h;
    this.r = new Vector(0.0, 0.0); 

    this.collision = function(curPos, prevPos)
    {
      var collide = false; 
      var i; 

      if(curPos.getX() < this.left)
      {
        curPos.setX(this.left); 
        collide = true; 
      }
      else if(curPos.getX() > this.right)
      {
        curPos.setX(this.right); 
        collide = true; 
      }
      if(curPos.getY() < this.top)
      {
        curPos.setY(this.top); 
        collide = true; 
      }
      else if(curPos.getY() > this.buttom)
      {
        curPos.setY(this.buttom); 
        collide = true; 
      }
      return collide; 
    }  
    this.draw = function(ctx, scaleFactor)
    {
    }
  }
  
  function PointMass(cx, cy, mass)
  {
    this.cur = new Vector(cx, cy); 
    this.prev = new Vector(cx, cy); 
    this.mass = mass; 
    this.force = new Vector(0.0, 0.0); 
    this.result = new Vector(0.0, 0.0); 
    this.friction = 0.01; 
    
    this.getXPos = function()
    {
      return this.cur.getX(); 
    }
    this.getYPos = function()
    {
      return this.cur.getY(); 
    }
    this.getPos = function()
    {
      return this.cur; 
    }
    this.getXPrevPos = function()
    {
      return this.prev.getX(); 
    }
    this.getYPrevPos = function()
    {
      return this.prev.getY(); 
    }
    this.getPrevPos = function()
    {
      return this.prev; 
    }
    this.addXPos = function(dx)
    {
      this.cur.addX(dx); 
    }
    this.addYPos = function(dy)
    {
      this.cur.addY(dy); 
    }
    this.setForce = function(force)
    {
      this.force.set(force); 
    }    
    this.addForce = function(force)
    {
      this.force.add(force); 
    }
    this.getMass = function()
    {
      return this.mass; 
    }
    this.setMass = function(mass)
    {
      this.mass = mass; 
    }
    this.move = function(dt)
    {
      var t, a, c, dtdt; 
      
      dtdt = dt * dt; 
      
      a = this.force.getX() / this.mass;
      c = this.cur.getX(); 
      t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getX() + a * dtdt;
      this.prev.setX(c); 
      this.cur.setX(t);
            
      a = this.force.getY() / this.mass;
      c = this.cur.getY(); 
      t = (2.0 - this.friction) * c - (1.0 - this.friction) * this.prev.getY() + a * dtdt;
      this.prev.setY(c); 
      this.cur.setY(t);
    }
    this.setFriction = function(friction)
    {
      this.friction = friction; 
    }
    this.getVelocity = function()
    {
      var cXpX, cYpY; 
      
      cXpX = this.cur.getX() - this.prev.getX(); 
      cYpY = this.cur.getY() - this.prev.getY();
      
      return cXpX * cXpX + cYpY * cYpY;  
    }
    this.draw = function(ctx, scaleFactor)
    {
      ctx.lineWidth = 2; 
      ctx.fillStyle = '#000000'; 
      ctx.strokeStyle = '#000000'; 
      ctx.beginPath(); 
      ctx.arc(this.cur.getX() * scaleFactor, 
              this.cur.getY() * scaleFactor, 
              4.0, 0.0, Math.PI * 2.0, true); 
      ctx.fill(); 
    }
  }
  
  function ConstraintY(pointMass, y, shortConst, longConst)
  {
    this.pointMass = pointMass; 
    this.y = y; 
    this.delta = new Vector(0.0, 0.0);
    this.shortConst = shortConst; 
    this.longConst = longConst;  
    
    this.sc = function()
    {      
      var dist; 
      
      dist = Math.abs(this.pointMass.getYPos() - this.y);
      this.delta.setY(-dist); 
       
      if(this.shortConst != 0.0 && dist < this.shortConst)
      {
        var scaleFactor; 
        
        scaleFactor = this.shortConst / dist; 
        this.delta.scale(scaleFactor); 
        pointMass.getPos().sub(this.delta); 
      } 
      else if(this.longConst != 0.0 && dist > this.longConst)
      {
        var scaleFactor; 
        
        scaleFactor = this.longConst / dist; 
        this.delta.scale(scaleFactor); 
        pointMass.getPos().sub(this.delta); 
      }
    } 
  }

  
  function Joint(pointMassA, pointMassB, shortConst, longConst)
  {
    this.pointMassA = pointMassA; 
    this.pointMassB = pointMassB; 
    this.delta = new Vector(0.0, 0.0);     
    this.pointMassAPos = pointMassA.getPos(); 
    this.pointMassBPos = pointMassB.getPos(); 
    
    this.delta.set(this.pointMassBPos); 
    this.delta.sub(this.pointMassAPos); 
    
    this.shortConst = this.delta.length() * shortConst; 
    this.longConst = this.delta.length() * longConst; 
    this.scSquared = this.shortConst * this.shortConst; 
    this.lcSquared = this.longConst * this.longConst; 

    this.setDist = function(shortConst, longConst)
    {
      this.shortConst = shortConst; 
      this.longConst = longConst; 
      this.scSquared = this.shortConst * this.shortConst; 
      this.lcSquared = this.longConst * this.longConst;     
    }
    this.scale = function(scaleFactor)
    {
      this.shortConst = this.shortConst * scaleFactor; 
      this.longConst = this.longConst * scaleFactor; 
      this.scSquared = this.shortConst * this.shortConst; 
      this.lcSquared = this.longConst * this.longConst;     
    }
    this.sc = function()
    {      
      this.delta.set(this.pointMassBPos); 
      this.delta.sub(this.pointMassAPos); 

      var dp = this.delta.dotProd(this.delta);
      
      if(this.shortConst != 0.0 && dp < this.scSquared)
      {
        var scaleFactor; 
        
        scaleFactor = this.scSquared / (dp + this.scSquared) - 0.5; 
        
        this.delta.scale(scaleFactor);
       
        this.pointMassAPos.sub(this.delta); 
        this.pointMassBPos.add(this.delta); 
      } 
      else if(this.longConst != 0.0 && dp > this.lcSquared)
      {
        var scaleFactor;
        
        scaleFactor = this.lcSquared / (dp + this.lcSquared) - 0.5; 
        
        this.delta.scale(scaleFactor);
       
        this.pointMassAPos.sub(this.delta); 
        this.pointMassBPos.add(this.delta);       
      }
    } 
  }
    
  function Stick(pointMassA, pointMassB)
  {
    function pointMassDist(pointMassA, pointMassB)
    {
      var aXbX, aYbY; 
    
      aXbX = pointMassA.getXPos() - pointMassB.getXPos(); 
      aYbY = pointMassA.getYPos() - pointMassB.getYPos(); 
    
      return Math.sqrt(aXbX * aXbX + aYbY * aYbY);  
    }
  
    this.length = pointMassDist(pointMassA, pointMassB); 
    this.lengthSquared = this.length * this.length; 
    this.pointMassA = pointMassA; 
    this.pointMassB = pointMassB; 
    this.delta = new Vector(0.0, 0.0); 
    
    this.getPointMassA = function()
    {
      return this.pointMassA; 
    }
    this.getPointMassB = function()
    {
      return this.pointMassB; 
    }
    this.scale = function(scaleFactor)
    {
      this.length *= scaleFactor; 
      this.lengthSquared = this.length * this.length; 
    }
    this.sc = function(env)
    {
      var dotProd, scaleFactor; 
      var pointMassAPos, pointMassBPos; 
    
      pointMassAPos = this.pointMassA.getPos(); 
      pointMassBPos = this.pointMassB.getPos(); 
    
      this.delta.set(pointMassBPos); 
      this.delta.sub(pointMassAPos); 

      dotProd = this.delta.dotProd(this.delta); 

      scaleFactor = this.lengthSquared / (dotProd + this.lengthSquared) - 0.5; 
      this.delta.scale(scaleFactor);
       
      pointMassAPos.sub(this.delta); 
      pointMassBPos.add(this.delta); 
    }
    this.setForce = function(force)
    {
      this.pointMassA.setForce(force); 
      this.pointMassB.setForce(force); 
    }
    this.addForce = function(force)
    {
      this.pointMassA.addForce(force); 
      this.pointMassB.addForce(force); 
    }
    this.move = function(dt)
    {
      this.pointMassA.move(dt); 
      this.pointMassB.move(dt); 
    }
    this.draw = function(ctx, scaleFactor)
    {
      this.pointMassA.draw(ctx, scaleFactor); 
      this.pointMassB.draw(ctx, scaleFactor); 
            
      ctx.lineWidth = 3; 
      ctx.fillStyle = '#000000'; 
      ctx.strokeStyle = '#000000'; 
      ctx.beginPath(); 
      ctx.moveTo(this.pointMassA.getXPos() * scaleFactor, 
                 this.pointMassA.getYPos() * scaleFactor); 
      ctx.lineTo(this.pointMassB.getXPos() * scaleFactor, 
                 this.pointMassB.getYPos() * scaleFactor); 
      ctx.stroke(); 
    }
  }
  
  function Spring(restLength, stiffness, damper, pointMassA, pointMassB)
  {
    this.restLength = restLength; 
    this.stiffness = stiffness; 
    this.damper = damper; 
    this.pointMassA = pointMassA; 
    this.pointMassB = pointMassB; 
    this.tmp = Vector(0.0, 0.0); 
    
    this.sc = function(env)
    {
      env.collistion(this.pointMassA.getPos(), this.pointMassA.getPrevPos()); 
      env.collistion(this.pointMassB.getPos(), this.pointMassB.getPrevPos()); 
    }
    
    this.move = function(dt)
    {
      var aXbX;
      var aYbY;
      var springForce; 
      var length; 
      
      aXbX = this.pointMassA.getXPos() - this.pointMassB.getXPos(); 
      aYbY = this.pointMassA.getYPos() - this.pointMassB.getYPos(); 
      
      length = Math.sqrt(aXbX * aXbX + aYbY * aYbY);
      springForce = this.stiffness * (length / this.restLength - 1.0);   
      
      var avXbvX; 
      var avYbvY; 
      var damperForce; 
      
      avXbvX = this.pointMassA.getXVel() - this.pointMassB.getXVel(); 
      avYbvY = this.pointMassA.getYVel() - this.pointMassB.getYVel(); 
      
      damperForce = avXbvX * aXbX + avYbvY * aYbY;
      damperForce *= this.damper; 
      
      var fx; 
      var fy; 
      
      fx = (springForce + damperForce) * aXbX; 
      fy = (springForce + damperForce) * aYbY; 
      
      this.tmp.setX(-fx); 
      this.tmp.setY(-ft); 
      this.pointMassA.addForce(this.tmp); 

      this.tmp.setX(fx); 
      this.tmp.setY(ft); 
      this.pointMassB.addForce(this.tmp); 
      
      this.pointMassA.move(dt); 
      this.pointMassB.move(dt); 
    }
    this.addForce = function(force)
    {
      this.pointMassA.addForce(force); 
      this.pointMassB.addForce(force); 
    }
    this.draw = function(ctx, scaleFactor)
    {
      this.pointMassA.draw(ctx, scaleFactor); 
      this.pointMassB.draw(ctx, scaleFactor); 
      
      ctx.fillStyle = '#000000'; 
      ctx.strokeStyle = '#000000'; 
      ctx.beginPath(); 
      ctx.moveTo(this.pointMassA.getXPos() * scaleFactor, 
                 this.pointMassA.getYPos() * scaleFactor); 
      ctx.lineTo(this.pointMassB.getXPos() * scaleFactor, 
                 this.pointMassB.getXPos() * scaleFactor); 
      ctx.stroke(); 
    }
  }

  function Blob(x, y, radius, numPointMasses)
  {
    this.x = x; 
    this.y = y; 
    this.sticks = new Array(); 
    this.pointMasses = new Array(); 
    this.joints = new Array(); 
    this.middlePointMass; 
    this.radius = radius; 
    this.drawFaceStyle = 1; 
    this.drawEyeStyle = 1; 
    this.selected = false; 
    
    numPointMasses = 8; 
    
    var f = 0.1; 
    var low = 0.95, high = 1.05;
    var t, i, p;
  
    function clampIndex(index, maxIndex)
    {
      index += maxIndex; 
      return index % maxIndex; 
    }

    for(i = 0, t = 0.0; i < numPointMasses; i++)
    {
      this.pointMasses[i] = new PointMass(Math.cos(t) * radius + x, Math.sin(t) * radius + y, 1.0); 
      t += 2.0 * Math.PI / numPointMasses; 
    }
    
    this.middlePointMass = new PointMass(x, y, 1.0); 
     
    this.pointMasses[0].setMass(4.0); 
    this.pointMasses[1].setMass(4.0); 
     
    for(i = 0; i < numPointMasses; i++)
    {
      this.sticks[i] = new Stick(this.pointMasses[i], this.pointMasses[clampIndex(i + 1, numPointMasses)]); 
    }

    for(i = 0, p = 0; i < numPointMasses; i++)
    {
      this.joints[p++] = new Joint(this.pointMasses[i], this.pointMasses[clampIndex(i + numPointMasses / 2 + 1, numPointMasses)], low, high);  
      this.joints[p++] = new Joint(this.pointMasses[i], this.middlePointMass, high * 0.9, low * 1.1); // 0.8, 1.2 works  
    }
    
    this.addBlob = function(blob)
    {
      var index = this.joints.length;
      var dist; 
       
      this.joints[index] = new Joint(this.middlePointMass, blob.getMiddlePointMass(), 0.0, 0.0); 
      dist = this.radius + blob.getRadius(); 
      this.joints[index].setDist(dist * 0.95, 0.0); 
    }
    this.getMiddlePointMass = function()
    {
      return this.middlePointMass; 
    }
    this.getRadius = function()
    {
      return this.radius; 
    }
    this.getXPos = function()
    {
      return this.middlePointMass.getXPos(); 
    }
    this.getYPos = function()
    {
      return this.middlePointMass.getYPos(); 
    }
    this.scale = function(scaleFactor)
    {
      var i; 
      
      for(i = 0; i < this.joints.length; i++)
      {
        this.joints[i].scale(scaleFactor); 
      }
      for(i = 0; i < this.sticks.length; i++)
      {
        this.sticks[i].scale(scaleFactor); 
      }
      this.radius *= scaleFactor; 
    }
    
    this.move = function(dt)
    {
      var i; 
      
      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].move(dt); 
      }
      this.middlePointMass.move(dt); 
    }
    this.sc = function(env)
    {
      var i, j; 
      
      for(j = 0; j < 4; j++)
      {
        for(i = 0; i < this.pointMasses.length; i++)
        {
          if(env.collision(this.pointMasses[i].getPos(), this.pointMasses[i].getPrevPos()) == true)
          {
            this.pointMasses[i].setFriction(0.75); 
          } 
          else 
          {
            this.pointMasses[i].setFriction(0.01); 
          }
        }
        for(i = 0; i < this.sticks.length; i++)
        {
          this.sticks[i].sc(env); 
        }
        for(i = 0; i < this.joints.length; i++)
        {
          this.joints[i].sc(); 
        }
      }
    }
    this.setForce = function(force)
    {
      var i; 
      
      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].setForce(force); 
      }
      this.middlePointMass.setForce(force); 
    }
    this.addForce = function(force)
    {
      var i; 
      
      for(i = 0; i < this.pointMasses.length; i++)
      {
        this.pointMasses[i].addForce(force); 
      }
      this.middlePointMass.addForce(force); 
      this.pointMasses[0].addForce(force); 
      this.pointMasses[0].addForce(force); 
      this.pointMasses[0].addForce(force); 
      this.pointMasses[0].addForce(force); 
    }
    this.moveTo = function(x, y)
    {
      var i, blobPos; 
      
      blobPos = this.middlePointMass.getPos(); 
      x -= blobPos.getX(x); 
      y -= blobPos.getY(y); 

      for(i = 0; i < this.pointMasses.length; i++)
      {
        blobPos = this.pointMasses[i].getPos(); 
        blobPos.addX(x); 
        blobPos.addY(y); 
      }
      blobPos = this.middlePointMass.getPos(); 
      blobPos.addX(x); 
      blobPos.addY(y); 
    }
    this.setSelected = function(selected)
    {
      this.selected = selected; 
    }
    
    this.drawEars = function(ctx, scaleFactor)
    {
      ctx.strokeStyle = "#000000"; 
      ctx.fillStyle = "#FFFFFF"; 
      ctx.lineWidth = 2; 

      ctx.beginPath(); 
      ctx.moveTo((-0.55 * this.radius) * scaleFactor, (-0.35 * this.radius) * scaleFactor);
      ctx.lineTo((-0.52 * this.radius) * scaleFactor, (-0.55 * this.radius) * scaleFactor);
      ctx.lineTo((-0.45 * this.radius) * scaleFactor, (-0.40 * this.radius) * scaleFactor);
      ctx.fill(); 
      ctx.stroke(); 
      
      ctx.beginPath(); 
      ctx.moveTo((0.55 * this.radius) * scaleFactor, (-0.35 * this.radius) * scaleFactor);
      ctx.lineTo((0.52 * this.radius) * scaleFactor, (-0.55 * this.radius) * scaleFactor);
      ctx.lineTo((0.45 * this.radius) * scaleFactor, (-0.40 * this.radius) * scaleFactor);
      ctx.fill(); 
      ctx.stroke(); 
    }
    
    this.drawHappyEyes1 = function(ctx, scaleFactor)
    {      
      ctx.lineWidth = 1; 
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); 
      ctx.arc((-0.15 * this.radius) * scaleFactor, 
              (-0.20 * this.radius) * scaleFactor, 
              this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.fill(); 
      ctx.stroke();  

      ctx.beginPath(); 
      ctx.arc(( 0.15 * this.radius) * scaleFactor, 
              (-0.20 * this.radius) * scaleFactor, 
              this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.fill(); 
      ctx.stroke();          

      ctx.fillStyle = "#000000";
      ctx.beginPath(); 
      ctx.arc((-0.15 * this.radius) * scaleFactor, 
              (-0.17 * this.radius) * scaleFactor, 
              this.radius * 0.06 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.fill();  

      ctx.beginPath(); 
      ctx.arc(( 0.15 * this.radius) * scaleFactor, 
              (-0.17 * this.radius) * scaleFactor, 
              this.radius * 0.06 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.fill();  
    }
    this.drawHappyEyes2 = function(ctx, scaleFactor)
    {      
      ctx.lineWidth = 1; 
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath(); 
      ctx.arc((-0.15 * this.radius) * scaleFactor, 
              (-0.20 * this.radius) * scaleFactor, 
              this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.stroke();  

      ctx.beginPath(); 
      ctx.arc(( 0.15 * this.radius) * scaleFactor, 
              (-0.20 * this.radius) * scaleFactor, 
              this.radius * 0.12 * scaleFactor, 0, 2.0 * Math.PI, false);
      ctx.stroke();          

      ctx.lineWidth = 1;       
      ctx.beginPath(); 
      ctx.moveTo((-0.25   * this.radius) * scaleFactor, 
                 (-0.20 * this.radius) * scaleFactor); 
      ctx.lineTo((-0.05 * this.radius) * scaleFactor, 
                 (-0.20 * this.radius) * scaleFactor); 
      ctx.stroke();  

      ctx.beginPath(); 
      ctx.moveTo(( 0.25   * this.radius) * scaleFactor, 
                 (-0.20 * this.radius) * scaleFactor); 
      ctx.lineTo(( 0.05 * this.radius) * scaleFactor, 
                 (-0.20 * this.radius) * scaleFactor); 
      ctx.stroke();  
    }
    this.drawHappyFace1 = function(ctx, scaleFactor)
    {      
      ctx.lineWidth = 2; 
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.beginPath(); 
      ctx.arc(0.0, 0.0, 
        this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
      ctx.stroke();
    }
    this.drawHappyFace2 = function(ctx, scaleFactor)
    {      
      ctx.lineWidth = 2; 
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.beginPath(); 
      ctx.arc(0.0, 0.0, 
        this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
      ctx.fill();  
    }
    this.drawOohFace = function(ctx, scaleFactor)
    {
      ctx.lineWidth = 2; 
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.beginPath(); 
      ctx.arc(0.0, (0.1 * this.radius) * scaleFactor, 
        this.radius * 0.25 * scaleFactor, 0, Math.PI, false);
      ctx.fill();  

      ctx.beginPath();

      ctx.moveTo((-0.25 * this.radius) * scaleFactor, (-0.3 * this.radius) * scaleFactor);
      ctx.lineTo((-0.05 * this.radius) * scaleFactor, (-0.2 * this.radius) * scaleFactor);
      ctx.lineTo((-0.25 * this.radius) * scaleFactor, (-0.1 * this.radius) * scaleFactor);

      ctx.moveTo((0.25 * this.radius) * scaleFactor, (-0.3 * this.radius) * scaleFactor);
      ctx.lineTo((0.05 * this.radius) * scaleFactor, (-0.2 * this.radius) * scaleFactor);
      ctx.lineTo((0.25 * this.radius) * scaleFactor, (-0.1 * this.radius) * scaleFactor);

      ctx.stroke();           
    } 
    this.drawFace = function(ctx, scaleFactor)
    {
      if(this.drawFaceStyle == 1 && Math.random() < 0.05)
      {
        this.drawFaceStyle = 2; 
      }
      else if(this.drawFaceStyle == 2 && Math.random() < 0.1)
      {
        this.drawFaceStyle = 1; 
      }

      if(this.drawEyeStyle == 1 && Math.random() < 0.025)
      {
        this.drawEyeStyle = 2; 
      }
      else if(this.drawEyeStyle == 2 && Math.random() < 0.3)
      {
        this.drawEyeStyle = 1; 
      }
                  
      if(this.middlePointMass.getVelocity() > 0.004)
      {    
        this.drawOohFace(ctx, scaleFactor);     
      }
      else 
      {
        if(this.drawFaceStyle == 1)
        {
          this.drawHappyFace1(ctx, scaleFactor, 0.0, -0.3);     
        }
        else 
        {
          this.drawHappyFace2(ctx, scaleFactor, 0.0, -0.3);     
        }
        
        if(this.drawEyeStyle == 1)
        {
          this.drawHappyEyes1(ctx, scaleFactor, 0.0, -0.3);     
        }
        else 
        {
          this.drawHappyEyes2(ctx, scaleFactor, 0.0, -0.3);     
        }
      }
    }
    this.getPointMass = function(index)
    {
      index += this.pointMasses.length; 
      index = index % this.pointMasses.length; 
      return this.pointMasses[index]; 
    }
    this.drawBody = function(ctx, scaleFactor)
    {
      var i; 
      
      ctx.strokeStyle = "#000000"; 
      if(this.selected == true)
      {
        ctx.fillStyle = "#FFCCCC"; 
      }
      else 
      {
        ctx.fillStyle = "#FFFFFF"; 
      }
      ctx.lineWidth = 5; 
      ctx.beginPath(); 
      ctx.moveTo(this.pointMasses[0].getXPos() * scaleFactor, 
        this.pointMasses[0].getYPos() * scaleFactor); 

      for(i = 0; i < this.pointMasses.length; i++)
      {
        var px, py, nx, ny, tx, ty, cx, cy; 
        var prevPointMass, currentPointMass, nextPointMass, nextNextPointMass;
        
        prevPointMass = this.getPointMass(i - 1); 
        currentPointMass = this.pointMasses[i]; 
        nextPointMass = this.getPointMass(i + 1);   
        nextNextPointMass = this.getPointMass(i + 2);   
        
        tx = nextPointMass.getXPos(); 
        ty = nextPointMass.getYPos(); 
        
        cx = currentPointMass.getXPos(); 
        cy = currentPointMass.getYPos(); 

        px = cx * 0.5 + tx * 0.5; 
        py = cy * 0.5 + ty * 0.5; 
        
        nx = cx - prevPointMass.getXPos() + tx - nextNextPointMass.getXPos();         
        ny = cy - prevPointMass.getYPos() + ty - nextNextPointMass.getYPos(); 
        
        px += nx * 0.16; 
        py += ny * 0.16; 
        
        px = px * scaleFactor; 
        py = py * scaleFactor; 
        
        tx = tx * scaleFactor; 
        ty = ty * scaleFactor; 
        
        ctx.bezierCurveTo(px, py, tx, ty, tx, ty);        
      }    

      ctx.closePath(); 
      ctx.stroke(); 
      ctx.fill(); 
    }
    this.drawSimpleBody = function(ctx, scaleFactor)
    {
      for(i = 0; i < this.sticks.length; i++)
      {
        this.sticks[i].draw(ctx, scaleFactor); 
      }
    }

    this.draw = function(ctx, scaleFactor)
    {
      var i; 
      var up, ori, ang; 
            
      this.drawBody(ctx, scaleFactor); 

      ctx.strokeStyle = "#000000"; 
      ctx.fillStyle = "#000000"

      ctx.save(); 
      ctx.translate(this.middlePointMass.getXPos() * scaleFactor, 
        (this.middlePointMass.getYPos() - 0.35 * this.radius) * scaleFactor); 
      
      up = new Vector(0.0, -1.0); 
      ori = new Vector(0.0, 0.0); 
      ori.set(this.pointMasses[0].getPos()); 
      ori.sub(this.middlePointMass.getPos()); 
      ang = Math.acos(ori.dotProd(up) / ori.length());
      if(ori.getX() < 0.0)
      {
        ctx.rotate(-ang);  
      }
      else 
      {
        ctx.rotate(ang);  
      }
      
      // this.drawEars(ctx, scaleFactor); 
      this.drawFace(ctx, scaleFactor); 
      
      ctx.restore(); 
    }    
  }
  
  function BlobCollective(x, y, startNum, maxNum)
  {
    this.maxNum = maxNum;
    this.numActive = 1; 
    this.blobs = new Array(); 
    this.tmpForce = new Vector(0.0, 0.0); 
    this.selectedBlob = null; 
    
    this.blobs[0] = new Blob(x, y, 0.4, 8); 
    
    this.split = function()
    {
      var i, maxIndex = 0, maxRadius = 0.0;
      var emptySlot; 
      var motherBlob, newBlob;  
    
      if(this.numActive == this.maxNum)
      {
        return; 
      }
      
      emptySlot = this.blobs.length;
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] != null && this.blobs[i].getRadius() > maxRadius)
        {
          maxRadius = this.blobs[i].getRadius(); 
          motherBlob = this.blobs[i]; 
        }
        else if(this.blobs[i] == null)
        {
          emptySlot = i; 
        }
      }
      
      motherBlob.scale(0.75); 
      newBlob = new Blob(motherBlob.getXPos(), 
        motherBlob.getYPos(), motherBlob.getRadius(), 8); 
        
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        this.blobs[i].addBlob(newBlob); 
        newBlob.addBlob(this.blobs[i]); 
      }
      this.blobs[emptySlot] = newBlob; 
        
      this.numActive++; 
    }
    
    this.findSmallest = function(exclude)
    {
      var minRadius = 1000.0, minIndex; 
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(i == exclude || this.blobs[i] == null)
        {
          continue; 
        }
        if(this.blobs[i].getRadius() < minRadius)
        {
          minIndex = i; 
          minRadius = this.blobs[i].getRadius();  
        }
      }
      return minIndex; 
    }
    this.findClosest = function(exclude)
    {
      var minDist = 1000.0, foundIndex, dist, aXbX, aYbY;
      var i;
      var myPointMass, otherPointMass;    

      myPointMass = this.blobs[exclude].getMiddlePointMass(); 
      for(i = 0; i < this.blobs.length; i++)
      {
        if(i == exclude || this.blobs[i] == null)
        {
          continue; 
        }
        
        otherPointMass = this.blobs[i].getMiddlePointMass(); 
        aXbX = myPointMass.getXPos() - otherPointMass.getXPos(); 
        aYbY = myPointMass.getYPos() - otherPointMass.getYPos(); 
        dist = aXbX * aXbX + aYbY * aYbY; 
        if(dist < minDist)
        {
          minDist = dist; 
          foundIndex = i; 
        }
      }
      return foundIndex; 
    }
    this.join = function()
    {
      var blob1Index, blob2Index, blob1, blob2; 
      var r1, r2, r3; 
      
      if(this.numActive == 1)
      {
        return; 
      }
      
      blob1Index = this.findSmallest(-1); 
      blob2Index = this.findClosest(blob1Index);
      
      r1 = this.blobs[blob1Index].getRadius(); 
      r2 = this.blobs[blob2Index].getRadius(); 
      r3 = Math.sqrt(r1 * r1 + r2 * r2); 
      
      this.blobs[blob1Index] = null; 
      this.blobs[blob2Index].scale(0.945 * r3 / r2); 
      
      this.numActive--; 
    }
    
    this.selectBlob = function(x, y)
    {
      var i, minDist = 10000.0; 
      var otherPointMass; 
      var selectedBlob; 
      var selectOffset = null; 
      
      if(this.selectedBlob != null)
      {
        return; 
      }
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        
        otherPointMass = this.blobs[i].getMiddlePointMass(); 
        aXbX = x - otherPointMass.getXPos(); 
        aYbY = y - otherPointMass.getYPos(); 
        dist = aXbX * aXbX + aYbY * aYbY; 
        if(dist < minDist)
        {
          minDist = dist; 
          if(dist < this.blobs[i].getRadius() * 0.5)
          {
            this.selectedBlob = this.blobs[i]; 
            selectOffset = { x : aXbX, y : aYbY };  
          }
        }
      }
      
      if(this.selectedBlob != null)
      {
        this.selectedBlob.setSelected(true); 
      }
      return selectOffset; 
    }
    this.unselectBlob = function()
    {
      if(this.selectedBlob == null)
      {
        return; 
      }
      this.selectedBlob.setSelected(false); 
      this.selectedBlob = null; 
    }
    this.selectedBlobMoveTo = function(x, y)
    {
      if(this.selectedBlob == null)
      {
        return; 
      }
      this.selectedBlob.moveTo(x, y); 
    }
    
    this.move = function(dt)
    {
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        this.blobs[i].move(dt); 
      }
    }
    this.sc = function(env)
    {
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        this.blobs[i].sc(env); 
      }    
      if(this.blobAnchor != null)
      {
        this.blobAnchor.sc(); 
      }
    }
    this.setForce = function(force)
    {
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        if(this.blobs[i] == this.selectedBlob)
        {
          this.blobs[i].setForce(new Vector(0.0, 0.0)); 
          continue; 
        }
        this.blobs[i].setForce(force); 
      }
    }
    this.addForce = function(force)
    {
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        if(this.blobs[i] == this.selectedBlob)
        {
          continue; 
        }
        this.tmpForce.setX(force.getX() * (Math.random() * 0.75 + 0.25)); 
        this.tmpForce.setY(force.getY() * (Math.random() * 0.75 + 0.25)); 
        this.blobs[i].addForce(this.tmpForce); 
      }
    }
    this.draw = function(ctx, scaleFactor)
    {
      var i; 
      
      for(i = 0; i < this.blobs.length; i++)
      {
        if(this.blobs[i] == null)
        {
          continue; 
        }
        this.blobs[i].draw(ctx, scaleFactor); 
      }    
    }
  }

  var env; 
  var width = 600.0; 
  var height = 400.0; 
  var scaleFactor = 200.0; 
  var blobColl; 
  var gravity; 
  var stopped; 
  var savedMouseCoords = null; 
  var selectOffset = null; 

  function update()
  {
    var dt = 0.05; 
    
    if(savedMouseCoords != null && selectOffset != null)
    {
      blobColl.selectedBlobMoveTo(savedMouseCoords.x - selectOffset.x, 
        savedMouseCoords.y - selectOffset.y); 
    }
    
    blobColl.move(dt); 
    blobColl.sc(env); 
    blobColl.setForce(gravity); 
  }

  function draw()
  {
    var canvas = document.getElementById('blob');
    if(canvas.getContext == null)
    {
      return; 
    }
     
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height); 
    
    env.draw(ctx, scaleFactor); 
    blobColl.draw(ctx, scaleFactor); 
  }
  
  function timeout()
  {
    draw(); 
    update(); 
        
    if(stopped == false)
    {
      setTimeout('timeout()', 30); 
    }
  }
  
  function init()
  {  
    var canvas = document.getElementById('blob');
    if(canvas.getContext == null)
    {
      alert("You need Firefox version 1.5 or higher for this to work, sorry."); 
      return; 
    }

    document.onkeydown = function(event) 
    {
      var keyCode; 
      
      if(event == null)
      {
        keyCode = window.event.keyCode; 
		//alert("keyCode=" + keyCode);
      }
      else 
      {
        keyCode = event.keyCode; 
		//alert("event=" + event + "; keyCode=" + keyCode);
      }

      switch(keyCode)
      {
        // left 
        case 37: 
          blobColl.addForce(new Vector(-50.0, 0.0)); 
          break; 
         
        // up 
        case 38: 
          blobColl.addForce(new Vector(0.0, -50.0)); 
          break; 
          
        // right 
        case 39: 
          blobColl.addForce(new Vector(50.0, 0.0)); 
          break; 
        
        // down
        case 40: 
          blobColl.addForce(new Vector(0.0, 50.0)); 
          break; 
          
        // join 'j' 
        case 74:
          blobColl.join(); 
          break;  
        
        // split 'h'
        case 72: 
          blobColl.split(); 
          break; 
          
        // toggle gravity 'g'
        case 71: 
          toggleGravity(); 
          break; 

        default: 
          break; 
      } 
    }
    
  
    function getMouseCoords(event)
    {
      if(event == null)
      {
        event = window.event; 
      }
      if(event == null)
      {
        return null; 
      }
      if(event.pageX || event.pageY){
        return {x:event.pageX / scaleFactor, y:event.pageY / scaleFactor};
      }
      return null;
    }
    document.onmousedown = function(event)
    {
      var mouseCoords; 
      
      if(stopped == true)
      {
        return; 
      }
      mouseCoords = getMouseCoords(event); 
      if(mouseCoords == null)
      {
        return; 
      }
	  //alert(mouseCoords);
      selectOffset = blobColl.selectBlob(mouseCoords.x, mouseCoords.y);         
    }
    document.onmouseup = function(event)
    {
      blobColl.unselectBlob(); 
      savedMouseCoords = null; 
      selectOffset = null; 
    }
    document.onmousemove = function(event)
    {
      var mouseCoords; 
      
      if(stopped == true)
      {
        return; 
      }
      if(selectOffset == null)
      {
        return; 
      }
      mouseCoords = getMouseCoords(event); 
      if(mouseCoords == null)
      {
        return; 
      }
      blobColl.selectedBlobMoveTo(mouseCoords.x - selectOffset.x, mouseCoords.y - selectOffset.y); 
      
      savedMouseCoords = mouseCoords; 
    }
    
    env = new Environment(0.2, 0.2, 2.6, 1.6); 
    blobColl = new BlobCollective(1.0, 1.0, 1, 200); 
    gravity = new Vector(0.0, 10.0); 
    stopped = false; 

    timeout(); 
  }

  function stop()
  {
    stopped = true; 
  }
  function start()
  {
    stopped = false; 
    timeout(); 
  }
  function toggleGravity()
  {
    if(gravity.getY() > 0.0)
    {
      gravity.setY(0.0); 
    }
    else 
    {
      gravity.setY(10.0); 
    }
  }
  

function log(msg)
{
  var textArea;

  textArea = document.getElementById("logArea");
  textArea.value = msg + "\n" + textArea.value;
}
function clearLog()
{
  var textArea;

  textArea = document.getElementById("logArea");
  textArea.value = "";
}

  
function doPageLoad()
{
	init();
	clearLog();
}


window.addEventListener("load", doPageLoad, false);