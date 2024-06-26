class particleSystem {
    
    constructor(parent,particle,count) 
    {
        this.particles = [];
        this.particleCount = 0;
        this.init(parent,particle,count);
    }

    init(parent,particle,count)
    {
        // var group=document.getElementById("Particles")
    
        for (let i = 0; i < count; i++) {
    
            var clone = particle.cloneNode(true);

            parent.appendChild(clone);
            this.particles.push(clone);
        }
    };

    spawn(props)
    {
        var particle = this.particles[this.particleCount];

        if(particle)
        {
            particle.life = props.life || 20;
            particle.position = props.position
            particle.velocity = props.velocity;
            particle.scale = props.scale.start
            particle.props = props;
            particle.spin = props.spin||0;
            particle.spinDirection = props.spinDirection||0;
            particle.rotation = 1;
            particle.setAttribute('visibility', 'visible');
            particle.props.opacity = particle.props.opacity || {start:1,end:1};
    
            this.particleCount +=1;
            particle.setAttribute("transform","translate("+(particle.position.x) +","+(particle.position.y)+") rotate("+particle.rotation+",0,0) scale("+(particle.scale)+")");
            particle = null;
        }
    };

    explode(count,props)
    {

    };

    remove()
    {
    };

    removeAll()
    {
    };

    update(dt) 
    {
        for (let i = this.particleCount-1; i >= 0; i--) 
        {
            var particle = this.particles[i];
            var progress = (particle.life/particle.props.life);
                particle.velocity.y += 1;
                particle.velocity.x *= 0.98;
                particle.velocity.y *= 0.98;
                particle.position.x += particle.velocity.x;
                particle.position.y += particle.velocity.y;
                particle.rotation += particle.spin;
                particle.rotation += ((Math.atan2(particle.velocity.y,particle.velocity.x)*(180/Math.PI)+90)-particle.rotation)*particle.spinDirection;
                particle.scale = (particle.props.scale.start*progress+particle.props.scale.end*(1-progress))
                // value1 + (value2 - value1) * amount
                //InterpolatedValue = X*t + Y*(1-t)
                particle.setAttribute("transform","translate("+(particle.position.x) +","+(particle.position.y)+") rotate("+particle.rotation+",0,0) scale("+(particle.scale)+")");
                // particle.setAttribute('r', 2+(particle.props.scale.start*progress+particle.props.scale.end*(1-progress)));
                // particle.setAttribute('cx', Number(particle.getAttribute("cx"))+particle.velocity.x*dt);
                // particle.setAttribute('cy', Number(particle.getAttribute("cy"))-particle.velocity.y*dt);
                particle.style.opacity = (particle.props.opacity.start*progress+particle.props.opacity.end*(1-progress));
                particle.life -= 1;

                if(particle.life <= 0)
                {
                    particle.setAttribute('visibility', 'hidden');
                    this.particles [i] = this.particles [this.particleCount-1]
                    this.particles [this.particleCount-1] = particle;
                    this.particleCount -=1;
                }
        };
    }
}